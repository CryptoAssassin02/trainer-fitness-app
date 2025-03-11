# Application Monitoring Guide

This guide explains how to use the monitoring system for the Trainer Fitness App.

## Overview

The monitoring system provides real-time insights into the health and performance of the application. It checks various components including:

- API health
- Database connectivity
- Perplexity AI integration
- Authentication services

## Monitoring Components

### 1. GitHub Actions Workflow

The application uses a GitHub Actions workflow (`monitor.yml`) to run scheduled health checks every 12 hours. The workflow can also be triggered manually with custom parameters.

```yaml
# .github/workflows/monitor.yml
name: Application Monitoring
on:
  schedule:
    - cron: '0 */12 * * *'  # Run every 12 hours
  workflow_dispatch:
    inputs:
      duration:
        description: 'Duration of monitoring in minutes'
        default: '5'
        required: true
      interval:
        description: 'Interval between checks in seconds'
        default: '30'
        required: true
      verbose:
        description: 'Enable verbose logging'
        type: boolean
        default: false
```

### 2. Monitoring Script

The monitoring script (`scripts/monitor.js`) performs the actual health checks and generates reports. It can be run locally or as part of the CI/CD pipeline.

#### Usage

```bash
# Run with default settings (5 minutes duration, 30 seconds interval)
node scripts/monitor.js

# Run with custom settings
node scripts/monitor.js --duration=10 --interval=60 --verbose
```

#### Parameters

- `--duration`: Duration of monitoring in minutes (default: 5)
- `--interval`: Interval between checks in seconds (default: 30)
- `--verbose`: Enable verbose logging (default: false)

## Health Endpoints

The application provides several health endpoints that the monitoring system checks:

### 1. API Health Check

```
GET /api/health
```

Returns the overall health status of the application, including database connectivity and service availability.

### 2. Authentication Status

```
GET /api/auth/status
```

Returns the current authentication service status.

## Monitoring Results

The monitoring script generates two types of results:

1. **Detailed Results**: Complete logs of all checks, including success/failure status, latency, and error messages.
2. **Summary Report**: A high-level overview of the monitoring session, including:
   - Total checks performed
   - Success rate
   - Service operational status
   - Average latency per service

Results are saved to the `monitoring-results` directory:
- `monitoring-results.json`: Latest summary report
- `detailed-results-{timestamp}.json`: Detailed logs for each monitoring session

## Visualizing Results

The monitoring system includes a visualization tool that generates an HTML report from the monitoring results. This provides an easy-to-read dashboard of the application's health status.

### Using the Visualization Tool

```bash
# Generate a visualization from the latest summary report
node scripts/visualize-monitoring.js

# Specify custom input and output files
node scripts/visualize-monitoring.js path/to/input.json path/to/output.html
```

The generated HTML file can be opened in any web browser and includes:

- Overall application health status
- Success rate and check counts
- Individual service health metrics
- Color-coded indicators for quick visual assessment

### Automated Visualizations

In CI/CD pipelines, visualizations are automatically generated and stored as artifacts. You can access these from:

1. **GitHub Actions**: Navigate to the Actions tab, select a monitoring run, and download the visualization artifact
2. **Deploy Pipelines**: Post-deployment monitoring includes visualizations for both staging and production environments

## Interpreting Results

The monitoring system classifies the overall application status as:

- **Healthy**: All checks passed successfully
- **Degraded**: Some checks passed, but others failed
- **Unhealthy**: Most or all checks failed

## Alerts and Notifications

The GitHub Actions workflow can be configured to send notifications when issues are detected:

1. **Email Notifications**: Configure GitHub to send email notifications when the workflow fails
2. **Slack Integration**: Add a Slack notification step to the workflow
3. **Custom Webhooks**: Implement custom webhooks for integration with other monitoring systems

## Troubleshooting

If the monitoring system reports issues, check the following:

1. **API Errors**: Review the detailed logs for specific error messages
2. **Database Connectivity**: Verify that the database is accessible and that the connection string is correct
3. **Perplexity API**: Check that the API key is valid and that rate limits haven't been exceeded
4. **Authentication Service**: Verify that Clerk is properly configured and operational

## Extending the Monitoring System

The monitoring system can be extended to check additional components:

1. **Add New Checks**: Implement new check functions in `monitor.js`
2. **Custom Metrics**: Track application-specific metrics
3. **Performance Monitoring**: Add checks for response times and resource usage

## Best Practices

1. **Regular Reviews**: Review monitoring results regularly to identify trends
2. **Threshold Adjustments**: Adjust thresholds based on observed performance
3. **Proactive Monitoring**: Address issues before they affect users
4. **Documentation**: Keep this guide updated with any changes to the monitoring system 