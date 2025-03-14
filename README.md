[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)


# CodeGuide Starter Pro

A modern web application starter template built with Next.js 14, featuring authentication, database integration, and payment processing capabilities.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18+ installed
- A [Clerk](https://clerk.com/) account for authentication
- A [Supabase](https://supabase.com/) account for database
- A [Stripe](https://stripe.com/) account for payments (optional)
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codeguide-starter-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the environment variables in `.env` (see Configuration section below)

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Configuration

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to API Keys
4. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Supabase Setup
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to Project Settings > API
4. Copy the `Project URL` as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon` public key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stripe Setup (Optional)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section
3. Add the required keys to your `.env` file

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Features

- 🔐 Authentication with Clerk
- 📦 Supabase Database
- 💳 Stripe Payments Integration
- 🎨 Modern UI with Tailwind CSS
- 🚀 App Router Ready
- 🔄 Real-time Updates
- 📱 Responsive Design

## Project Structure

```
codeguide-starter/
├── app/                # Next.js app router pages
├── components/         # React components
├── utils/             # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
├── documentation/     # Generated documentation from CodeGuide
└── supabase/          # Supabase configurations and migrations
```

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:
   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:
   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md             
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# trAIner Fitness App

A cutting-edge fitness application that uses AI to help users create personalized workout plans, track their progress, and achieve their fitness goals.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and fill in the values)
4. Run the development server:
   ```
   npm run dev
   ```

## Setting Up Perplexity AI Integration

The trAIner app uses Perplexity AI for research-based fitness content. Follow these steps to set up the integration:

1. **Get a Perplexity API Key**:
   - Sign up for an account at [Perplexity AI](https://www.perplexity.ai/)
   - Navigate to your account settings and generate an API key

2. **Configure Environment Variables**:
   - Add your API key to the `.env` file:
     ```
     PERPLEXITY_API_KEY=your_actual_api_key_here
     ```

3. **Testing the Integration**:
   - Use the ExerciseResearch component to validate that the integration is working correctly
   - Check the Network tab in your browser's developer tools to confirm API calls are successful

4. **Troubleshooting**:
   - If you encounter a 401 error, verify your API key is correct
   - For development without an API key, the app will use simulated responses
   - For more detailed troubleshooting, refer to `/documentation/perplexity_ai_integration.md`

## Features

- AI-powered workout plan generation
- Exercise research with evidence-based information
- Progress tracking with visual charts
- Macro calculations and nutrition guidance
- User authentication and profile management
- Responsive design for mobile and desktop

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Clerk Authentication
- OpenAI API
- Perplexity AI

## CI/CD Status

[![CI](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/ci.yml/badge.svg)](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/ci.yml)
[![Deploy](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/deploy.yml)
[![Simple CI](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/simple-ci.yml/badge.svg)](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/simple-ci.yml)
[![Code Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/ci.yml)
[![Monitoring](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/monitor.yml/badge.svg)](https://github.com/CryptoAssassin02/trainer-fitness-app/actions/workflows/monitor.yml)

## Production Status

- **Current Version**: 1.0.0
- **Last Deployment**: Staging
- **Environment**: Development

## Monitoring System

The application includes a comprehensive monitoring system that tracks the health and performance of various services:

- API Health: Checks the overall status of the application API
- Database: Verifies database connectivity and operations
- Perplexity AI: Monitors the integration with Perplexity AI services
- Authentication: Ensures the authentication system is operational

### Monitoring Scripts

Several scripts are available to test and visualize the monitoring system:

- **Production Monitoring**: `node scripts/monitor.js [options]`
  - Run monitoring against the production deployment
  - Options: `--duration=<minutes> --interval=<seconds> --verbose`

- **Test Monitoring**: `node scripts/test-monitoring.js [--visualize]`
  - Run monitoring with visualization options

- **Local Test** (for development): `node scripts/test-local-monitoring.js [--visualize]`
  - Run a simulated test with mock data
  - Perfect for testing visualization and UI without real API connections
  - Generates mock results that simulate real-world scenarios

### Monitoring Visualization

To view the monitoring results as a visual report:

1. Run any monitoring script with the `--visualize` flag
2. Open the generated `monitoring-report.html` file in your browser
3. The report includes:
   - Overall system status
   - Service-specific metrics and statuses
   - Response time graphs
   - Success rate visualization

### CI/CD Integration

The monitoring system is integrated with CI/CD workflows:

- Regular health checks run on a 12-hour schedule
- Status badge automatically updates on the repository
- Monitoring results are saved as artifacts for later analysis

### Monitoring Dashboard

Access the monitoring dashboard at `/monitoring` when running the application locally or in production.

## Future Improvements

The following improvements are planned for future releases:

1. **Real-time Monitoring Dashboard**: Develop a dedicated real-time dashboard within the application to view monitoring data and receive instant alerts.

2. **Alert System**: Implement notification mechanisms (email, Slack, SMS) for critical service failures to enable quick response to system issues.

3. **Historical Data Analysis**: Add functionality to analyze monitoring data over time to identify trends, predict potential issues, and optimize resource allocation.

4. **Service-specific Deep Diagnostics**: Enhance monitoring with more detailed diagnostics for each service, including memory usage, CPU load, and request patterns.

5. **User-impact Correlation**: Connect monitoring data with user experience metrics to understand the real-world impact of service issues on application usability.

6. **Distributed Tracing**: Implement distributed tracing across microservices to track request flows and identify bottlenecks in the system architecture.

7. **Custom Health Check API**: Develop a more comprehensive health check API that provides granular insights into system components.

8. **Geographic Performance Monitoring**: Add monitoring for application performance across different geographic regions to ensure consistent user experience globally.
