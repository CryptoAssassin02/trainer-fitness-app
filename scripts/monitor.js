#!/usr/bin/env node

/**
 * Application Monitoring Script
 * 
 * This script checks the health of the application and its dependencies.
 * It can be run on a schedule or manually.
 * 
 * Usage:
 *   node scripts/monitor.js [--duration=<minutes>] [--interval=<seconds>] [--verbose]
 * 
 * Options:
 *   --duration  Duration of monitoring in minutes (default: 5)
 *   --interval  Interval between checks in seconds (default: 30)
 *   --verbose   Enable verbose logging (default: false)
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  duration: 5, // minutes
  interval: 30, // seconds
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--duration=')) {
    options.duration = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--interval=')) {
    options.interval = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Environment variables
const PROD_URL = process.env.PROD_URL || 'https://trainer-fitness-app.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Initialize monitoring results
const results = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0,
  errorChecks: 0,
  services: {
    api: { operational: false, checks: [], latency: [] },
    database: { operational: false, checks: [], latency: [] },
    perplexity: { operational: false, checks: [], latency: [] },
    auth: { operational: false, checks: [], latency: [] }
  },
  errors: []
};

// Initialize Supabase client if credentials are available
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Log a message with color
 * @param {string} message - Message to log
 * @param {string} color - Color to use
 */
function log(message, color = colors.white) {
  if (options.verbose || color === colors.red) {
    console.log(`${color}${message}${colors.reset}`);
  }
}

/**
 * Check the health of the API
 * @returns {Promise<Object>} - Health check result
 */
async function checkApiHealth() {
  const startTime = Date.now();
  try {
    const response = await fetch(`${PROD_URL}/api/health`);
    const data = await response.json();
    const latency = Date.now() - startTime;
    
    return {
      success: response.ok && data.status === 'healthy',
      latency,
      data
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Check the database connection
 * @returns {Promise<Object>} - Database check result
 */
async function checkDatabase() {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  const startTime = Date.now();
  try {
    const { data, error } = await supabase
      .from('perplexity_cache')
      .select('count(*)')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      latency,
      data
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Check the Perplexity API
 * @returns {Promise<Object>} - Perplexity API check result
 */
async function checkPerplexityApi() {
  if (!PERPLEXITY_API_KEY) {
    return { success: false, error: 'Perplexity API key not available' };
  }

  const startTime = Date.now();
  try {
    const response = await fetch(`${PROD_URL}/api/ai/perplexity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What is a simple exercise for beginners?',
        model: 'mixtral-8x7b-instruct',
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    const data = await response.json();
    const latency = Date.now() - startTime;
    
    return {
      success: response.ok && data.content && data.content.length > 0,
      latency,
      data: { responseLength: data.content ? data.content.length : 0 }
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Check the authentication service
 * @returns {Promise<Object>} - Auth check result
 */
async function checkAuth() {
  const startTime = Date.now();
  try {
    const response = await fetch(`${PROD_URL}/api/auth/status`);
    const data = await response.json();
    const latency = Date.now() - startTime;
    
    return {
      success: response.ok,
      latency,
      data
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Run all health checks
 */
async function runHealthChecks() {
  log('Running health checks...', colors.cyan);
  results.totalChecks++;

  try {
    // Check API health
    const apiHealth = await checkApiHealth();
    results.services.api.checks.push({
      timestamp: new Date().toISOString(),
      success: apiHealth.success,
      data: apiHealth.data,
      error: apiHealth.error
    });
    
    if (apiHealth.success) {
      results.services.api.operational = true;
      results.services.api.latency.push(apiHealth.latency);
      log(`✅ API health check passed (${apiHealth.latency}ms)`, colors.green);
      results.successfulChecks++;
    } else {
      results.services.api.operational = false;
      log(`❌ API health check failed: ${apiHealth.error}`, colors.red);
      results.failedChecks++;
    }

    // Check database
    const dbHealth = await checkDatabase();
    results.services.database.checks.push({
      timestamp: new Date().toISOString(),
      success: dbHealth.success,
      data: dbHealth.data,
      error: dbHealth.error
    });
    
    if (dbHealth.success) {
      results.services.database.operational = true;
      results.services.database.latency.push(dbHealth.latency);
      log(`✅ Database check passed (${dbHealth.latency}ms)`, colors.green);
      results.successfulChecks++;
    } else {
      results.services.database.operational = false;
      log(`❌ Database check failed: ${dbHealth.error}`, colors.red);
      results.failedChecks++;
    }

    // Check Perplexity API
    const perplexityHealth = await checkPerplexityApi();
    results.services.perplexity.checks.push({
      timestamp: new Date().toISOString(),
      success: perplexityHealth.success,
      data: perplexityHealth.data,
      error: perplexityHealth.error
    });
    
    if (perplexityHealth.success) {
      results.services.perplexity.operational = true;
      results.services.perplexity.latency.push(perplexityHealth.latency);
      log(`✅ Perplexity API check passed (${perplexityHealth.latency}ms)`, colors.green);
      results.successfulChecks++;
    } else {
      results.services.perplexity.operational = false;
      log(`❌ Perplexity API check failed: ${perplexityHealth.error}`, colors.red);
      results.failedChecks++;
    }

    // Check Auth
    const authHealth = await checkAuth();
    results.services.auth.checks.push({
      timestamp: new Date().toISOString(),
      success: authHealth.success,
      data: authHealth.data,
      error: authHealth.error
    });
    
    if (authHealth.success) {
      results.services.auth.operational = true;
      results.services.auth.latency.push(authHealth.latency);
      log(`✅ Auth check passed (${authHealth.latency}ms)`, colors.green);
      results.successfulChecks++;
    } else {
      results.services.auth.operational = false;
      log(`❌ Auth check failed: ${authHealth.error}`, colors.red);
      results.failedChecks++;
    }
  } catch (error) {
    log(`❌ Error running health checks: ${error.message}`, colors.red);
    results.errors.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    });
    results.errorChecks++;
  }
}

/**
 * Calculate average latency for a service
 * @param {Array} latencies - Array of latency values
 * @returns {number} - Average latency
 */
function calculateAverageLatency(latencies) {
  if (latencies.length === 0) return 0;
  return Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length);
}

/**
 * Generate a summary report
 * @returns {Object} - Summary report
 */
function generateSummaryReport() {
  const avgLatencies = {
    api: calculateAverageLatency(results.services.api.latency),
    database: calculateAverageLatency(results.services.database.latency),
    perplexity: calculateAverageLatency(results.services.perplexity.latency),
    auth: calculateAverageLatency(results.services.auth.latency)
  };

  const summary = {
    duration: `${options.duration} minutes`,
    interval: `${options.interval} seconds`,
    totalChecks: results.totalChecks,
    successfulChecks: results.successfulChecks,
    failedChecks: results.failedChecks,
    errorChecks: results.errorChecks,
    successRate: results.totalChecks > 0 
      ? Math.round((results.successfulChecks / results.totalChecks) * 100) 
      : 0,
    services: {
      api: {
        operational: results.services.api.operational,
        avgLatency: avgLatencies.api,
        successRate: results.services.api.checks.length > 0
          ? Math.round((results.services.api.checks.filter(c => c.success).length / results.services.api.checks.length) * 100)
          : 0
      },
      database: {
        operational: results.services.database.operational,
        avgLatency: avgLatencies.database,
        successRate: results.services.database.checks.length > 0
          ? Math.round((results.services.database.checks.filter(c => c.success).length / results.services.database.checks.length) * 100)
          : 0
      },
      perplexity: {
        operational: results.services.perplexity.operational,
        avgLatency: avgLatencies.perplexity,
        successRate: results.services.perplexity.checks.length > 0
          ? Math.round((results.services.perplexity.checks.filter(c => c.success).length / results.services.perplexity.checks.length) * 100)
          : 0
      },
      auth: {
        operational: results.services.auth.operational,
        avgLatency: avgLatencies.auth,
        successRate: results.services.auth.checks.length > 0
          ? Math.round((results.services.auth.checks.filter(c => c.success).length / results.services.auth.checks.length) * 100)
          : 0
      }
    },
    overallStatus: results.successfulChecks > 0 && results.failedChecks === 0 && results.errorChecks === 0
      ? 'healthy'
      : results.successfulChecks > results.failedChecks
        ? 'degraded'
        : 'unhealthy'
  };

  return summary;
}

/**
 * Save monitoring results to a file
 */
function saveResults() {
  results.endTime = new Date().toISOString();
  
  const summary = generateSummaryReport();
  
  // Create results directory if it doesn't exist
  const resultsDir = path.join(process.cwd(), 'monitoring-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const detailedResultsPath = path.join(resultsDir, `detailed-results-${timestamp}.json`);
  fs.writeFileSync(detailedResultsPath, JSON.stringify(results, null, 2));
  
  // Save summary
  const summaryPath = path.join(resultsDir, 'monitoring-results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  // Log summary to console
  console.log('\n📊 Monitoring Summary:');
  console.log(`Duration: ${summary.duration}`);
  console.log(`Interval: ${summary.interval}`);
  console.log(`Total Checks: ${summary.totalChecks}`);
  console.log(`Successful Checks: ${summary.successfulChecks}`);
  console.log(`Failed Checks: ${summary.failedChecks}`);
  console.log(`Error Checks: ${summary.errorChecks}`);
  console.log(`Success Rate: ${summary.successRate}%`);
  console.log(`Overall Status: ${summary.overallStatus.toUpperCase()}`);
  
  console.log('\nService Status:');
  Object.entries(summary.services).forEach(([service, status]) => {
    const statusColor = status.operational ? colors.green : colors.red;
    console.log(`${statusColor}${service}: ${status.operational ? 'Operational' : 'Not Operational'} (${status.successRate}% success, ${status.avgLatency}ms avg latency)${colors.reset}`);
  });
  
  console.log(`\nDetailed results saved to: ${detailedResultsPath}`);
  console.log(`Summary saved to: ${summaryPath}`);
  
  // Exit with appropriate code
  process.exit(summary.overallStatus === 'healthy' ? 0 : 1);
}

/**
 * Main function
 */
async function main() {
  log(`Starting monitoring for ${options.duration} minutes with ${options.interval} second intervals`, colors.cyan);
  log(`Verbose logging: ${options.verbose ? 'enabled' : 'disabled'}`, colors.cyan);
  
  // Run initial health check
  await runHealthChecks();
  
  // Set up interval for remaining duration
  if (options.duration > 0) {
    const intervalId = setInterval(async () => {
      await runHealthChecks();
    }, options.interval * 1000);
    
    // Stop after duration
    setTimeout(() => {
      clearInterval(intervalId);
      saveResults();
    }, options.duration * 60 * 1000);
  } else {
    // Just run once
    saveResults();
  }
}

// Start monitoring
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}); 