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

## Monitoring

The application includes a comprehensive monitoring system that checks the health and performance of various components:

- API health and responsiveness
- Database connectivity
- Perplexity AI integration
- Authentication services

### Monitoring Tools

- **Automated Monitoring**: GitHub Actions workflow runs checks every 12 hours
- **Manual Monitoring**: Run monitoring scripts locally for immediate feedback
- **Monitoring Reports**: Detailed reports are generated for each monitoring session

### Running Monitoring Locally

```bash
# Run with default settings (5 minutes duration, 30 seconds interval)
node scripts/monitor.js

# Run with custom settings
node scripts/monitor.js --duration=10 --interval=60 --verbose

# Quick test of the monitoring system
node scripts/test-monitoring.js
```

For more details, see the [Monitoring Guide](./documentation/monitoring_guide.md).
