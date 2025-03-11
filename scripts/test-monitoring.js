#!/usr/bin/env node

/**
 * Test Monitoring Script
 * 
 * This script runs a quick test of the monitoring system to verify it's working correctly.
 * It runs a single monitoring cycle with minimal duration and outputs the results.
 * 
 * Usage:
 *   node scripts/test-monitoring.js [--visualize]
 * 
 * Options:
 *   --visualize  Generate HTML visualization of results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldVisualize = args.includes('--visualize');

console.log('🧪 Testing monitoring system...');

// Create monitoring-results directory if it doesn't exist
const resultsDir = path.join(process.cwd(), 'monitoring-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
  console.log('📁 Created monitoring-results directory');
}

try {
  // Run the monitoring script with minimal duration
  console.log('🔄 Running monitoring script with minimal duration...');
  execSync('node scripts/monitor.js --duration=1 --interval=10 --verbose', { 
    stdio: 'inherit',
    timeout: 70000 // 70 seconds timeout
  });
  
  // Check if results were generated
  const summaryPath = path.join(resultsDir, 'monitoring-results.json');
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    
    console.log('\n📊 Monitoring Test Results:');
    console.log(`Total Checks: ${summary.totalChecks}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    console.log(`Overall Status: ${summary.overallStatus.toUpperCase()}`);
    
    console.log('\nService Status:');
    Object.entries(summary.services).forEach(([service, status]) => {
      const statusSymbol = status.operational ? '✅' : '❌';
      console.log(`${statusSymbol} ${service}: ${status.operational ? 'Operational' : 'Not Operational'} (${status.successRate}% success, ${status.avgLatency}ms avg latency)`);
    });
    
    // Generate visualization if requested
    if (shouldVisualize) {
      console.log('\n🎨 Generating visualization...');
      try {
        execSync('node scripts/visualize-monitoring.js', { stdio: 'inherit' });
        console.log('✅ Visualization generated successfully');
        console.log('📄 Open monitoring-report.html in your browser to view the report');
      } catch (visualizeError) {
        console.error('❌ Failed to generate visualization:', visualizeError.message);
      }
    }
    
    console.log('\n✅ Monitoring test completed successfully');
    process.exit(0);
  } else {
    console.error('❌ Monitoring results not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Monitoring test failed:', error.message);
  process.exit(1);
} 