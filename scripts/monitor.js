#!/usr/bin/env node

/**
 * Application Monitoring Script
 * 
 * This script monitors the health and performance of the application
 * by regularly checking API endpoints and logging results.
 * 
 * Usage:
 *   node scripts/monitor.js --interval 5 --duration 60 --output monitor-logs.json
 * 
 * Options:
 *   --interval: Check interval in minutes (default: 5)
 *   --duration: Total monitoring duration in minutes (default: 60, 0 for infinite)
 *   --output:   Output file for logs (default: monitor-logs.json)
 *   --verbose:  Enable verbose logging (default: false)
 */

// For Node.js environments that don't have fetch natively
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const os = require('os');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  interval: 5,
  duration: 60,
  output: 'monitor-logs.json',
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--interval' && args[i + 1]) {
    options.interval = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--duration' && args[i + 1]) {
    options.duration = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.output = args[i + 1];
    i++;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Initialize Supabase client if environment variables are available
let supabaseClient = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Base URL for the application
const baseUrl = process.env.APP_URL || 'http://localhost:3000';

// Initialize log file
const logFilePath = path.resolve(process.cwd(), options.output);
let logs = [];
if (fs.existsSync(logFilePath)) {
  try {
    logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}Error reading log file: ${error.message}${colors.reset}`);
    logs = [];
  }
}

// Monitoring metrics
let totalChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;
let totalResponseTime = 0;
let perplexityApiCalls = 0;
let perplexityApiErrors = 0;
let startTime = Date.now();

// Monitor the application
async function monitorApplication() {
  console.log(`\n${colors.blue}=== Monitoring Run #${totalChecks + 1} ====${colors.reset}`);
  console.log(`${colors.blue}Date: ${new Date().toISOString()}${colors.reset}`);
  
  const monitoringResults = {
    timestamp: new Date().toISOString(),
    checks: {},
    system: {
      cpuUsage: os.loadavg(),
      memoryUsage: process.memoryUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: process.uptime()
    }
  };
  
  // Check API health
  try {
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/api/health`);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const healthData = await response.json();
      
      monitoringResults.checks.health = {
        status: 'success',
        responseTime,
        data: healthData
      };
      
      console.log(`${colors.green}Health Check: ${healthData.status} (${responseTime}ms)${colors.reset}`);
      if (options.verbose) {
        console.log(`${colors.cyan}Database: ${healthData.database ? 'Connected' : 'Disconnected'}${colors.reset}`);
        console.log(`${colors.cyan}Perplexity: ${healthData.services?.perplexity ? 'Available' : 'Unavailable'}${colors.reset}`);
        console.log(`${colors.cyan}OpenAI: ${healthData.services?.openai ? 'Available' : 'Unavailable'}${colors.reset}`);
        console.log(`${colors.cyan}Clerk: ${healthData.services?.clerk ? 'Available' : 'Unavailable'}${colors.reset}`);
      }
    } else {
      monitoringResults.checks.health = {
        status: 'failed',
        responseTime,
        statusCode: response.status,
        statusText: response.statusText
      };
      
      console.log(`${colors.red}Health Check Failed: ${response.status} ${response.statusText} (${responseTime}ms)${colors.reset}`);
    }
    
    totalResponseTime += responseTime;
  } catch (error) {
    monitoringResults.checks.health = {
      status: 'error',
      error: error.message
    };
    
    console.log(`${colors.red}Health Check Error: ${error.message}${colors.reset}`);
    failedChecks++;
  }
  
  // Check Perplexity API (simulated test query)
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/ai/perplexity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: "What's a good warmup exercise before weightlifting?",
          model: "mixtral-8x7b-instruct",
          temperature: 0.7,
          max_tokens: 100
        })
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        monitoringResults.checks.perplexity = {
          status: 'success',
          responseTime,
          dataSize: JSON.stringify(data).length,
          fromCache: data.fromCache || false
        };
        
        perplexityApiCalls++;
        console.log(`${colors.green}Perplexity API: Success (${responseTime}ms)${colors.reset}`);
        if (options.verbose && data.fromCache) {
          console.log(`${colors.yellow}Response from cache${colors.reset}`);
        }
      } else {
        const errorText = await response.text();
        
        monitoringResults.checks.perplexity = {
          status: 'failed',
          responseTime,
          statusCode: response.status,
          statusText: response.statusText,
          error: errorText
        };
        
        perplexityApiErrors++;
        console.log(`${colors.red}Perplexity API Failed: ${response.status} ${response.statusText} (${responseTime}ms)${colors.reset}`);
        if (options.verbose) {
          console.log(`${colors.red}Error: ${errorText}${colors.reset}`);
        }
      }
    } catch (error) {
      monitoringResults.checks.perplexity = {
        status: 'error',
        error: error.message
      };
      
      perplexityApiErrors++;
      console.log(`${colors.red}Perplexity API Error: ${error.message}${colors.reset}`);
    }
  } else {
    monitoringResults.checks.perplexity = {
      status: 'skipped',
      reason: 'PERPLEXITY_API_KEY not available'
    };
    
    console.log(`${colors.yellow}Perplexity API Check: Skipped (API key not available)${colors.reset}`);
  }
  
  // Check database if Supabase client is available
  if (supabaseClient) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabaseClient
        .from('perplexity_cache')
        .select('count', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;
      
      if (!error) {
        monitoringResults.checks.database = {
          status: 'success',
          responseTime,
          data: { cacheCount: data }
        };
        
        console.log(`${colors.green}Database Check: Success (${responseTime}ms)${colors.reset}`);
      } else {
        monitoringResults.checks.database = {
          status: 'failed',
          responseTime,
          error: error.message
        };
        
        console.log(`${colors.red}Database Check Failed: ${error.message} (${responseTime}ms)${colors.reset}`);
      }
    } catch (error) {
      monitoringResults.checks.database = {
        status: 'error',
        error: error.message
      };
      
      console.log(`${colors.red}Database Check Error: ${error.message}${colors.reset}`);
    }
  } else {
    monitoringResults.checks.database = {
      status: 'skipped',
      reason: 'Supabase client not initialized'
    };
    
    console.log(`${colors.yellow}Database Check: Skipped (Supabase client not initialized)${colors.reset}`);
  }
  
  // Update metrics
  totalChecks++;
  let checkSuccess = true;
  Object.values(monitoringResults.checks).forEach(check => {
    if (check.status === 'failed' || check.status === 'error') {
      checkSuccess = false;
    }
  });
  
  if (checkSuccess) {
    successfulChecks++;
  } else {
    failedChecks++;
  }
  
  // Add monitoring results to logs
  logs.push(monitoringResults);
  
  // Write logs to file
  try {
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    if (options.verbose) {
      console.log(`${colors.blue}Logs written to ${logFilePath}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error writing to log file: ${error.message}${colors.reset}`);
  }
  
  // Print summary
  const runTime = Math.floor((Date.now() - startTime) / 1000);
  const avgResponseTime = totalResponseTime / totalChecks;
  
  console.log(`\n${colors.magenta}=== Monitoring Summary ====${colors.reset}`);
  console.log(`${colors.magenta}Total Checks: ${totalChecks}${colors.reset}`);
  console.log(`${colors.magenta}Successful Checks: ${successfulChecks} (${Math.round(successfulChecks / totalChecks * 100)}%)${colors.reset}`);
  console.log(`${colors.magenta}Failed Checks: ${failedChecks} (${Math.round(failedChecks / totalChecks * 100)}%)${colors.reset}`);
  console.log(`${colors.magenta}Average Response Time: ${Math.round(avgResponseTime)}ms${colors.reset}`);
  console.log(`${colors.magenta}Total Runtime: ${runTime}s${colors.reset}`);
  console.log(`${colors.magenta}Perplexity API Calls: ${perplexityApiCalls}${colors.reset}`);
  console.log(`${colors.magenta}Perplexity API Errors: ${perplexityApiErrors} (${Math.round(perplexityApiErrors / (perplexityApiCalls || 1) * 100)}%)${colors.reset}`);
}

// Start monitoring
console.log(`${colors.blue}Starting application monitoring${colors.reset}`);
console.log(`${colors.blue}Interval: ${options.interval} minutes${colors.reset}`);
console.log(`${colors.blue}Duration: ${options.duration === 0 ? 'Infinite' : options.duration + ' minutes'}${colors.reset}`);
console.log(`${colors.blue}Output: ${logFilePath}${colors.reset}`);

// Run initial check
monitorApplication();

// Set up interval for monitoring
const intervalId = setInterval(async () => {
  await monitorApplication();
  
  // Check if monitoring duration has been reached
  if (options.duration > 0) {
    const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
    if (elapsedMinutes >= options.duration) {
      clearInterval(intervalId);
      console.log(`\n${colors.blue}Monitoring completed after ${Math.round(elapsedMinutes)} minutes${colors.reset}`);
      process.exit(0);
    }
  }
}, options.interval * 60 * 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  clearInterval(intervalId);
  console.log(`\n${colors.blue}Monitoring stopped by user${colors.reset}`);
  process.exit(0);
});

console.log(`\n${colors.blue}Press Ctrl+C to stop monitoring${colors.reset}`); 