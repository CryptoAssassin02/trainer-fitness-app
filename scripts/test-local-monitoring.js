#!/usr/bin/env node

/**
 * Local Monitoring Test Script
 * 
 * This script runs a test of the monitoring system in a local development environment
 * by mocking the necessary responses to simulate a successful monitoring session.
 * 
 * Usage:
 *   node scripts/test-local-monitoring.js [--visualize]
 * 
 * Options:
 *   --visualize  Generate HTML visualization of results
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldVisualize = args.includes('--visualize');

console.log('🧪 Testing monitoring system with mock data...');

// Create monitoring-results directory if it doesn't exist
const resultsDir = path.join(process.cwd(), 'monitoring-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
  console.log('📁 Created monitoring-results directory');
}

// Generate mock monitoring results
const mockResults = {
  startTime: new Date(Date.now() - 60000).toISOString(),
  endTime: new Date().toISOString(),
  duration: "1 minutes",
  interval: "10 seconds",
  totalChecks: 6,
  successfulChecks: 5,
  failedChecks: 1,
  errorChecks: 0,
  successRate: 83,
  services: {
    api: {
      operational: true,
      avgLatency: 120,
      successRate: 100
    },
    database: {
      operational: true,
      avgLatency: 250,
      successRate: 100
    },
    perplexity: {
      operational: false,
      avgLatency: 780,
      successRate: 33
    },
    auth: {
      operational: true,
      avgLatency: 180,
      successRate: 100
    }
  },
  overallStatus: "degraded"
};

// Save the mock results
const summaryPath = path.join(resultsDir, 'monitoring-results.json');
fs.writeFileSync(summaryPath, JSON.stringify(mockResults, null, 2));
console.log('✅ Generated mock monitoring results');

// Display summary information
console.log('\n📊 Monitoring Test Results (Mock Data):');
console.log(`Total Checks: ${mockResults.totalChecks}`);
console.log(`Success Rate: ${mockResults.successRate}%`);
console.log(`Overall Status: ${mockResults.overallStatus.toUpperCase()}`);

console.log('\nService Status:');
Object.entries(mockResults.services).forEach(([service, status]) => {
  const statusSymbol = status.operational ? '✅' : '❌';
  console.log(`${statusSymbol} ${service}: ${status.operational ? 'Operational' : 'Not Operational'} (${status.successRate}% success, ${status.avgLatency}ms avg latency)`);
});

// Generate visualization if requested
if (shouldVisualize) {
  console.log('\n🎨 Generating visualization...');
  try {
    // Check if visualize-monitoring.js exists
    const visualizerPath = path.join(process.cwd(), 'scripts', 'visualize-monitoring.js');
    if (fs.existsSync(visualizerPath)) {
      const { execSync } = require('child_process');
      execSync('node scripts/visualize-monitoring.js', { stdio: 'inherit' });
      console.log('✅ Visualization generated successfully');
      console.log('📄 Open monitoring-report.html in your browser to view the report');
    } else {
      console.error('❌ Visualization script not found:', visualizerPath);
    }
  } catch (visualizeError) {
    console.error('❌ Failed to generate visualization:', visualizeError.message);
  }
}

// Generate a detailed mock results file too
const detailedMockData = {
  startTime: mockResults.startTime,
  endTime: mockResults.endTime,
  totalChecks: mockResults.totalChecks,
  successfulChecks: mockResults.successfulChecks,
  failedChecks: mockResults.failedChecks,
  errorChecks: mockResults.errorChecks,
  services: {
    api: {
      operational: mockResults.services.api.operational,
      checks: [
        {
          timestamp: new Date(Date.now() - 50000).toISOString(),
          success: true,
          data: { status: 'healthy', database: true, services: { perplexity: true, openai: true, clerk: true } }
        },
        {
          timestamp: new Date(Date.now() - 40000).toISOString(),
          success: true,
          data: { status: 'healthy', database: true, services: { perplexity: true, openai: true, clerk: true } }
        }
      ],
      latency: [110, 130]
    },
    database: {
      operational: mockResults.services.database.operational,
      checks: [
        {
          timestamp: new Date(Date.now() - 50000).toISOString(),
          success: true,
          data: { count: 42 }
        },
        {
          timestamp: new Date(Date.now() - 40000).toISOString(),
          success: true,
          data: { count: 42 }
        }
      ],
      latency: [240, 260]
    },
    perplexity: {
      operational: mockResults.services.perplexity.operational,
      checks: [
        {
          timestamp: new Date(Date.now() - 50000).toISOString(),
          success: true,
          data: { responseLength: 256 }
        },
        {
          timestamp: new Date(Date.now() - 40000).toISOString(),
          success: false,
          error: 'Rate limit exceeded'
        }
      ],
      latency: [750, 810]
    },
    auth: {
      operational: mockResults.services.auth.operational,
      checks: [
        {
          timestamp: new Date(Date.now() - 50000).toISOString(),
          success: true,
          data: { authenticated: true, status: 'success' }
        },
        {
          timestamp: new Date(Date.now() - 40000).toISOString(),
          success: true,
          data: { authenticated: true, status: 'success' }
        }
      ],
      latency: [170, 190]
    }
  },
  errors: []
};

const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
const detailedResultsPath = path.join(resultsDir, `detailed-results-${timestamp}.json`);
fs.writeFileSync(detailedResultsPath, JSON.stringify(detailedMockData, null, 2));
console.log(`\n✅ Detailed mock results saved to: ${detailedResultsPath}`);

console.log('\n✅ Local monitoring test completed successfully');

console.log('\n⚠️ Note: This is a simulated test with mock data.');
console.log('Real monitoring results may differ when running in a production environment.');
console.log('Use this test only for visualization and interface testing purposes.'); 