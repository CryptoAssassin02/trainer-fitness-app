#!/usr/bin/env node

/**
 * Monitoring Visualization Script
 * 
 * This script generates an HTML visualization of monitoring results
 * for easier analysis and reporting.
 * 
 * Usage:
 *   node scripts/visualize-monitoring.js [input_file] [output_file]
 * 
 * Example:
 *   node scripts/visualize-monitoring.js monitoring-results/monitoring-results.json monitoring-report.html
 */

const fs = require('fs');
const path = require('path');

// Handle command line arguments
const args = process.argv.slice(2);
const inputFile = args[0] || path.join('monitoring-results', 'monitoring-results.json');
const outputFile = args[1] || 'monitoring-report.html';

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${inputFile}' not found.`);
  console.error('Run monitoring first or specify a valid input file.');
  process.exit(1);
}

try {
  // Read monitoring results
  const results = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  // Generate HTML report
  const html = generateHtml(results);
  
  // Write HTML file
  fs.writeFileSync(outputFile, html);
  
  console.log(`Monitoring visualization saved to: ${outputFile}`);
  console.log(`Open this file in a web browser to view the report.`);
} catch (error) {
  console.error(`Error generating visualization: ${error.message}`);
  process.exit(1);
}

/**
 * Generate HTML report from monitoring results
 * @param {Object} results - Monitoring results
 * @returns {string} - HTML content
 */
function generateHtml(results) {
  // Overall status color
  const statusColor = results.overallStatus === 'healthy' 
    ? '#4CAF50' 
    : results.overallStatus === 'degraded' 
      ? '#FF9800' 
      : '#F44336';
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Generate service status HTML
  const servicesHtml = Object.entries(results.services)
    .map(([service, status]) => {
      const serviceStatusColor = status.operational ? '#4CAF50' : '#F44336';
      const latencyColor = status.avgLatency < 500 
        ? '#4CAF50' 
        : status.avgLatency < 1000 
          ? '#FF9800' 
          : '#F44336';
      
      return `
        <div class="service-card">
          <div class="service-header">
            <h3>${service.toUpperCase()}</h3>
            <span class="status-badge" style="background-color: ${serviceStatusColor}">
              ${status.operational ? 'Operational' : 'Not Operational'}
            </span>
          </div>
          <div class="service-metrics">
            <div class="metric">
              <span class="metric-label">Success Rate:</span>
              <span class="metric-value">${status.successRate}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Avg Latency:</span>
              <span class="metric-value" style="color: ${latencyColor}">${status.avgLatency}ms</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
  
  // Generate HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trainer Fitness App - Monitoring Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .status-overview {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .status-badge {
      padding: 8px 12px;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 14px;
    }
    .summary-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-data {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .data-card {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .data-value {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .data-label {
      font-size: 14px;
      color: #666;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .service-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .service-header h3 {
      margin: 0;
      font-size: 18px;
    }
    .service-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .metric {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
    }
    .metric-value {
      font-size: 18px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monitoring Report</h1>
    <div class="status-overview">
      <p>Overall Status:</p>
      <span class="status-badge" style="background-color: ${statusColor}">
        ${results.overallStatus.toUpperCase()}
      </span>
    </div>
  </div>
  
  <div class="summary-section">
    <h2>Summary</h2>
    <div class="summary-data">
      <div class="data-card">
        <div class="data-value">${results.successRate}%</div>
        <div class="data-label">Success Rate</div>
      </div>
      <div class="data-card">
        <div class="data-value">${results.totalChecks}</div>
        <div class="data-label">Total Checks</div>
      </div>
      <div class="data-card">
        <div class="data-value">${results.successfulChecks}</div>
        <div class="data-label">Successful Checks</div>
      </div>
      <div class="data-card">
        <div class="data-value">${results.failedChecks}</div>
        <div class="data-label">Failed Checks</div>
      </div>
      <div class="data-card">
        <div class="data-value">${results.duration}</div>
        <div class="data-label">Monitoring Duration</div>
      </div>
      <div class="data-card">
        <div class="data-value">${results.interval}</div>
        <div class="data-label">Check Interval</div>
      </div>
    </div>
  </div>
  
  <div class="summary-section">
    <h2>Service Status</h2>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
  
  <div class="footer">
    <p>Report generated on ${formatDate(new Date().toISOString())}</p>
    <p>Trainer Fitness App - Monitoring System</p>
  </div>
</body>
</html>
`;
} 