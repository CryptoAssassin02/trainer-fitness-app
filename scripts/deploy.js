#!/usr/bin/env node
/**
 * Deployment Readiness Test Script (JavaScript version)
 * 
 * This script tests various components of the application to verify they're working correctly
 * before deployment. It checks database connectivity, authentication, and core features.
 * 
 * Run with: node scripts/deploy.js
 */

// Import required dependencies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Try to import the perplexity packages
let perplexity;
let perplexitySdk;
let usingMock = false;
let usingRealSdk = false;

try {
  perplexity = require('perplexity-ai');
  
  // Check if this is our mock implementation
  if (perplexity) {
    const mockPath = path.join(__dirname, '..', 'mocks', 'perplexity-ai');
    const resolvedPath = require.resolve('perplexity-ai');
    usingMock = resolvedPath.includes('mocks') || 
                (typeof perplexity.search === 'function' && 
                 perplexity.search.toString().includes('[MOCK]'));
    
    if (usingMock) {
      console.log('Using mock perplexity-ai package');
    } else {
      console.log('Using real perplexity-ai package');
    }
  }
} catch (err) {
  console.log('Perplexity AI package not found.');
  perplexity = null;
}

try {
  perplexitySdk = require('perplexity-sdk');
  if (perplexitySdk) {
    usingRealSdk = true;
    console.log('Found perplexity-sdk package');
  }
} catch (err) {
  console.log('Perplexity SDK not found.');
  perplexitySdk = null;
}

// Color output for console
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

// Environment variables validation
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY'
];

const optionalVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_VERCEL_URL'
];

async function main() {
  console.log(blue(bold('🔍 Deployment Readiness Test\n')));
  
  // Check environment variables
  console.log(yellow('Checking environment variables...'));
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log(red(`❌ Missing required environment variables: ${missingVars.join(', ')}`));
    console.log(red('   Please add these to your .env file before deploying.'));
  } else {
    console.log(green('✅ All required environment variables are set'));
  }
  
  let warningVars = [];
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warningVars.push(varName);
    }
  }
  
  if (warningVars.length > 0) {
    console.log(yellow(`⚠️  Missing optional environment variables: ${warningVars.join(', ')}`));
    console.log(yellow('   Consider adding these if you need the related functionality.'));
  } else {
    console.log(green('✅ All optional environment variables are set'));
  }
  
  console.log('');
  
  // Test Supabase connection
  console.log(yellow('Testing Supabase connection...'));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log(red('❌ Missing Supabase credentials'));
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(red(`❌ Supabase connection error: ${error.message}`));
    } else {
      console.log(green('✅ Supabase connection successful'));
    }
  } catch (err) {
    console.log(red(`❌ Supabase connection failed: ${err}`));
  }
  
  console.log('');
  
  // Check required database tables
  console.log(yellow('Checking database tables...'));
  const requiredTables = [
    'profiles',
    'workout_plans',
    'workout_days',
    'exercises',
    'progress_checkins',
    'nutrition_macros',
    'notification_preferences',
    'notifications',
    'perplexity_cache',
    'perplexity_analytics',
    'perplexity_rate_limits'
  ];
  
  let missingTables = [];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        missingTables.push(table);
        console.log(red(`❌ Table '${table}' error: ${error.message}`));
      } else {
        console.log(green(`✅ Table '${table}' exists`));
      }
    } catch (err) {
      missingTables.push(table);
      console.log(red(`❌ Error checking table '${table}': ${err}`));
    }
  }
  
  console.log('');
  
  if (missingTables.length > 0) {
    console.log(red(`❌ Missing required tables: ${missingTables.join(', ')}`));
    console.log(red('   Please run the database setup scripts before deploying.'));
  } else {
    console.log(green('✅ All required database tables exist'));
  }
  
  // Test Perplexity API
  console.log('');
  console.log(yellow('Testing Perplexity AI functionality...'));
  
  if (!perplexity && !perplexitySdk) {
    console.log(red('❌ Neither perplexity-ai nor perplexity-sdk packages found'));
    console.log(yellow('   You need to install at least one of these packages before deployment:'));
    console.log(yellow('   npm install perplexity-sdk --save'));
  } else {
    if (usingMock) {
      console.log(red('⚠️  WARNING: Using mock Perplexity AI package'));
      console.log(red('   This will NOT work properly in production!'));
      console.log(yellow('   Before deployment, install the real package:'));
      console.log(yellow('   npm uninstall perplexity-ai && npm install perplexity-sdk --save'));
    }
    
    if (usingRealSdk) {
      console.log(green('✅ Using perplexity-sdk package (recommended for production)'));
    }
    
    try {
      // Test basic search functionality with whatever package is available
      let result;
      
      if (perplexity) {
        result = await perplexity.search({
          userContent: "What's a good workout for beginners?",
          temperature: 0.7
        });
        
        if (result && result.answer) {
          console.log(green('✅ Perplexity AI search working correctly'));
          console.log(blue(`   Sample response: "${result.answer.substring(0, 100)}..."`));
        } else {
          console.log(red('❌ Perplexity AI search returned empty or invalid result'));
        }
        
        // Test cache functionality
        const stats = perplexity.getStats();
        if (stats) {
          console.log(green('✅ Perplexity AI cache stats available'));
          console.log(blue(`   Cache stats: ${JSON.stringify(stats)}`));
        } else {
          console.log(yellow('⚠️ Perplexity AI cache stats not available'));
        }
      } else if (perplexitySdk) {
        console.log(yellow('ℹ️  Skipping perplexity-sdk test in this environment'));
        console.log(yellow('   SDK tests require configuring the API client which is better done in code'));
      }
    } catch (err) {
      console.log(red(`❌ Perplexity AI functionality error: ${err.message || err}`));
    }
  }
  
  // Check package.json for perplexity-ai dependency configuration
  console.log('');
  console.log(yellow('Checking package.json configuration...'));
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies['perplexity-ai'] && 
        packageJson.dependencies['perplexity-ai'].includes('file:')) {
      console.log(red('⚠️  WARNING: package.json contains a local file reference to perplexity-ai'));
      console.log(red('   This will NOT work in production environments!'));
      console.log(yellow('   Before deployment, update package.json to use perplexity-sdk:'));
      console.log(yellow('   npm uninstall perplexity-ai && npm install perplexity-sdk --save'));
    } else if (packageJson.dependencies && packageJson.dependencies['perplexity-sdk']) {
      console.log(green('✅ package.json correctly configured with perplexity-sdk'));
    } else {
      console.log(yellow('⚠️  perplexity-sdk not found in package.json dependencies'));
    }
  } catch (err) {
    console.log(red(`❌ Error checking package.json: ${err.message || err}`));
  }
  
  // Show summary
  console.log('\n' + blue(bold('📋 Deployment Readiness Summary:')));
  
  const perplexityIssue = !perplexity && !perplexitySdk || usingMock;
  
  if (missingVars.length > 0 || missingTables.length > 0 || perplexityIssue) {
    console.log(red('❌ The application is NOT ready for deployment.'));
    console.log(red('   Please fix the issues above before proceeding.'));
  } else if (warningVars.length > 0) {
    console.log(yellow('⚠️  The application is MOSTLY ready for deployment.'));
    console.log(yellow('   Review the warnings above before proceeding.'));
  } else {
    console.log(green('✅ The application is READY for deployment!'));
  }
}

main().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
}); 