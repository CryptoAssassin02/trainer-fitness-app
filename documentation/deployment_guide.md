# trAIner Fitness App - Deployment Guide

This guide provides instructions for deploying the trAIner fitness app to production environments.

## Deployment Readiness Testing

Before deploying the application, it's important to verify that all components are working correctly. 
We provide several tools to help with this process.

### Using the Deployment Helper Script

The easiest way to test deployment readiness is using our helper script:

```bash
# Run deployment readiness tests
./scripts/deploy.sh

# Or use this command if the script isn't executable
bash scripts/deploy.sh
```

The deployment helper script supports several commands:

- `./scripts/deploy.sh` or `./scripts/deploy.sh test` - Run deployment readiness tests
- `./scripts/deploy.sh prepare` - Prepare the application for production (fix dependencies)
- `./scripts/deploy.sh build` - Build the application for production
- `./scripts/deploy.sh preview` - Build and start a production preview server
- `./scripts/deploy.sh help` - Show usage information

### What Gets Tested

The deployment readiness tests check several components:

1. **Environment Variables** - Verifies that all required environment variables are set
2. **Supabase Connection** - Tests the connection to the Supabase database
3. **Database Tables** - Checks that all required database tables exist
4. **Perplexity AI** - Verifies that the Perplexity AI functionality is working
5. **Cache Efficiency** - Tests that caching mechanisms are functioning properly
6. **Package Configuration** - Checks for development-only mock implementations

## Preparing for Production

The application uses mock implementations for some dependencies during development. Before deploying to production, you need to replace these with the real implementations.

### Replacing the Mock Perplexity AI Package

In development, we use a mock implementation of the Perplexity AI API to avoid hitting rate limits. For production, you need to replace this with the real SDK.

Run the preparation script:

```bash
./scripts/deploy.sh prepare
```

This script will:

1. Check for mock dependencies in package.json
2. Offer to replace the mock perplexity-ai package with perplexity-sdk
3. Update your dependencies
4. Run the deployment readiness tests to verify the changes

After running this script, you may need to update your imports in code that uses the Perplexity AI functionality:

```typescript
// Before (using mock)
import { search } from "perplexity-ai";

// After (using SDK)
import Perplexity from "perplexity-sdk";
const perplexity = new Perplexity({ apiKey: process.env.PERPLEXITY_API_KEY }).client();
```

## Deployment Process

### 1. Environment Setup

Ensure all required environment variables are set in your deployment environment:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENAI_API_KEY
PERPLEXITY_API_KEY
```

Optional environment variables include:

```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_VERCEL_URL
```

### 2. Build the Application

To build the application for production:

```bash
npm run build
```

Or use our helper script:

```bash
./scripts/deploy.sh build
```

### 3. Start the Production Server

To start the production server:

```bash
npm run start
```

Or use our helper script to build and start in one step:

```bash
./scripts/deploy.sh preview
```

## Deployment Environments

### Vercel

The recommended deployment platform is Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy from the main branch

### Other Platforms

The application can also be deployed to other platforms that support Node.js, such as:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Heroku

Follow the specific deployment instructions for your chosen platform, ensuring that all environment variables are properly configured.

## Post-Deployment Monitoring

After deploying the application, it's important to monitor its health and performance to ensure it's functioning correctly.

### Monitoring System

The application includes a comprehensive monitoring system that checks various components:

1. **API Health**: Verifies that the API endpoints are responding correctly
2. **Database Connectivity**: Checks that the application can connect to the database
3. **Perplexity AI Integration**: Validates that the AI features are working properly
4. **Authentication Services**: Ensures that user authentication is functioning

### Automated Monitoring

The monitoring system runs automatically through GitHub Actions:

1. **Scheduled Checks**: Health checks run every 12 hours
2. **Manual Triggers**: You can manually trigger monitoring with custom parameters
3. **Deployment Verification**: Monitoring runs automatically after each deployment

### Monitoring Dashboard

Monitoring results are available in several ways:

1. **GitHub Actions**: View results in the Actions tab of the repository
2. **Monitoring Reports**: Check the `monitoring-results` directory for detailed reports
3. **Status Badge**: The README includes a monitoring status badge

### Responding to Issues

If the monitoring system detects issues:

1. Check the detailed logs for specific error messages
2. Verify that all required environment variables are set correctly
3. Check service dependencies (Supabase, Perplexity, Clerk)
4. Review recent code changes that might have introduced issues

For more details, see the [Monitoring Guide](./monitoring_guide.md).

## Troubleshooting

If you encounter issues during deployment:

1. Run the deployment readiness tests to identify issues
2. Check environment variables are correctly set
3. Verify database connections and schemas
4. Check logs for specific error messages
5. Make sure you've replaced development mocks with production implementations

For more help, refer to the project's GitHub issues or contact the development team. 