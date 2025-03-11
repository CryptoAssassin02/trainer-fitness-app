#!/usr/bin/env node
/**
 * End-to-End Testing Script
 * 
 * This script walks through the entire application and tests each component
 * in real-time to ensure everything is functioning correctly.
 * 
 * Usage: node scripts/test-e2e.js
 */

const { exec, execSync } = require('child_process');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config();

// Color output for console
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

// Test status tracking
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// App configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
let isAppRunning = false;
let serverProcess = null;

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main test function
 */
async function main() {
  console.log(blue(bold('\n🧪 trAIner Fitness App End-to-End Test Runner\n')));
  
  try {
    // Check if server is running and start if not
    isAppRunning = await checkServerRunning();
    
    if (!isAppRunning) {
      const startServer = await promptYesNo('App server is not running. Would you like to start it now?');
      
      if (startServer) {
        await startAppServer();
      } else {
        console.log(yellow('⚠️  Skipping tests that require a running server'));
      }
    } else {
      console.log(green('✅ App server is already running at ' + BASE_URL));
    }
    
    console.log(blue(bold('\n📋 Starting Tests\n')));
    
    // Run environment tests
    await runTest('Environment Variables Test', testEnvironmentVariables);
    
    // Run database tests
    await runTest('Database Connection Test', testDatabaseConnection);
    await runTest('Database Tables Test', testDatabaseTables);
    
    // Run API tests
    await runTest('API Health Check', testApiHealth);
    await runTest('Perplexity API Test', testPerplexityApi);
    
    // Run caching tests
    await runTest('Cache Validation Test', testCacheValidation);
    
    // Run UI component tests (these require user interaction)
    await runTest('Workout Generation Test', testWorkoutGeneration, true);
    await runTest('Exercise Research Test', testExerciseResearch, true);
    
    // Display summary
    console.log(blue(bold('\n📊 Test Summary\n')));
    console.log(green(`✅ Passed: ${passedTests}`));
    console.log(red(`❌ Failed: ${failedTests}`));
    console.log(yellow(`⚠️  Skipped: ${skippedTests}`));
    
    // Close server if we started it
    if (serverProcess) {
      console.log(yellow('\nShutting down app server...'));
      serverProcess.kill();
    }
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error(red('Test runner error:'), error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Run a specific test with error handling
 */
async function runTest(name, testFn, isInteractive = false) {
  console.log(blue(`Running test: ${name}...`));
  
  try {
    if (isInteractive) {
      const shouldRun = await promptYesNo(`Would you like to run the interactive test: ${name}?`);
      
      if (!shouldRun) {
        console.log(yellow(`⚠️  Skipping ${name}`));
        skippedTests++;
        return;
      }
    }
    
    const result = await testFn();
    
    if (result.success) {
      console.log(green(`✅ ${name} passed: ${result.message}`));
      passedTests++;
    } else {
      console.log(red(`❌ ${name} failed: ${result.message}`));
      failedTests++;
    }
  } catch (error) {
    console.log(red(`❌ ${name} error: ${error.message}`));
    failedTests++;
  }
  
  console.log(''); // Add spacing between tests
}

/**
 * Test that required environment variables are set
 */
async function testEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'OPENAI_API_KEY',
    'PERPLEXITY_API_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    return {
      success: false,
      message: `Missing environment variables: ${missing.join(', ')}`
    };
  }
  
  return {
    success: true,
    message: 'All required environment variables are set'
  };
}

/**
 * Test connection to Supabase
 */
async function testDatabaseConnection() {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client could not be initialized'
    };
  }
  
  try {
    const { data, error } = await supabase.rpc('ping');
    
    if (error) {
      return {
        success: false,
        message: `Database connection error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: `Database connection error: ${error.message}`
    };
  }
}

/**
 * Test that required database tables exist
 */
async function testDatabaseTables() {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client could not be initialized'
    };
  }
  
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
  
  const missingTables = [];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        missingTables.push(table);
      }
    } catch (error) {
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    return {
      success: false,
      message: `Missing tables: ${missingTables.join(', ')}`
    };
  }
  
  return {
    success: true,
    message: 'All required database tables exist'
  };
}

/**
 * Test the health of API endpoints
 */
async function testApiHealth() {
  if (!isAppRunning) {
    return {
      success: false,
      message: 'App server is not running'
    };
  }
  
  try {
    // Try to access the /api/health endpoint
    const response = await fetch(`${BASE_URL}/api/health`);
    
    if (!response.ok) {
      return {
        success: false,
        message: `API health check failed with status: ${response.status}`
      };
    }
    
    const data = await response.json();
    
    if (!data.healthy) {
      return {
        success: false,
        message: 'API reports unhealthy status'
      };
    }
    
    return {
      success: true,
      message: 'API health check successful'
    };
  } catch (error) {
    return {
      success: false,
      message: `API health check failed: ${error.message}`
    };
  }
}

/**
 * Test the Perplexity API integration
 */
async function testPerplexityApi() {
  if (!isAppRunning) {
    return {
      success: false,
      message: 'App server is not running'
    };
  }
  
  try {
    // Try to access the Perplexity API endpoint
    const response = await fetch(`${BASE_URL}/api/ai/perplexity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userContent: 'What are the best exercises for beginners?',
        systemContent: 'You are a fitness expert. Keep your answer short.',
        model: 'sonar-small-chat',
        temperature: 0.7,
        maxTokens: 300
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        message: `Perplexity API test failed: ${error}`
      };
    }
    
    const data = await response.json();
    
    if (!data.text || data.text.length < 50) {
      return {
        success: false,
        message: 'Perplexity API returned insufficient response'
      };
    }
    
    // Call it again to test caching
    const cachedResponse = await fetch(`${BASE_URL}/api/ai/perplexity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userContent: 'What are the best exercises for beginners?',
        systemContent: 'You are a fitness expert. Keep your answer short.',
        model: 'sonar-small-chat',
        temperature: 0.7,
        maxTokens: 300
      })
    });
    
    if (!cachedResponse.ok) {
      return {
        success: false,
        message: 'Perplexity API cache test failed'
      };
    }
    
    return {
      success: true,
      message: 'Perplexity API integration working correctly'
    };
  } catch (error) {
    return {
      success: false,
      message: `Perplexity API test failed: ${error.message}`
    };
  }
}

/**
 * Test the cache validation utility
 */
async function testCacheValidation() {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client could not be initialized'
    };
  }
  
  try {
    // Check cache tables have appropriate data
    const { data: cacheData, error: cacheError } = await supabase
      .from('perplexity_cache')
      .select('query_hash, access_count')
      .limit(5);
    
    if (cacheError) {
      return {
        success: false,
        message: `Cache validation failed: ${cacheError.message}`
      };
    }
    
    // Check analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('perplexity_analytics')
      .select('cached, response_time_ms')
      .limit(5);
    
    if (analyticsError) {
      return {
        success: false,
        message: `Analytics validation failed: ${analyticsError.message}`
      };
    }
    
    return {
      success: true,
      message: `Cache validation successful. Found ${cacheData.length} cache entries and ${analyticsData.length} analytics entries.`
    };
  } catch (error) {
    return {
      success: false,
      message: `Cache validation failed: ${error.message}`
    };
  }
}

/**
 * Interactive test for workout generation
 */
async function testWorkoutGeneration() {
  if (!isAppRunning) {
    return {
      success: false,
      message: 'App server is not running'
    };
  }
  
  console.log(yellow('Interactive Test: Workout Generation'));
  console.log('Please follow these steps:');
  console.log('1. Open your browser to: ' + BASE_URL + '/workouts/generate');
  console.log('2. Enter workout preferences and generate a workout');
  console.log('3. Check that the generated workout looks reasonable');
  
  const success = await promptYesNo('Did the workout generation work correctly?');
  
  return {
    success,
    message: success 
      ? 'Workout generation test passed based on user confirmation' 
      : 'Workout generation test failed based on user feedback'
  };
}

/**
 * Interactive test for exercise research
 */
async function testExerciseResearch() {
  if (!isAppRunning) {
    return {
      success: false,
      message: 'App server is not running'
    };
  }
  
  console.log(yellow('Interactive Test: Exercise Research'));
  console.log('Please follow these steps:');
  console.log('1. Navigate to any workout plan or the exercise research component');
  console.log('2. Search for information about an exercise (e.g., "squat form tips")');
  console.log('3. Check that the results are relevant and helpful');
  
  const success = await promptYesNo('Did the exercise research feature work correctly?');
  
  return {
    success,
    message: success 
      ? 'Exercise research test passed based on user confirmation' 
      : 'Exercise research test failed based on user feedback'
  };
}

/**
 * Helper function to prompt for yes/no
 */
function promptYesNo(question) {
  return new Promise(resolve => {
    rl.question(`${question} (y/n) `, answer => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Check if server is already running
 */
async function checkServerRunning() {
  try {
    const response = await fetch(BASE_URL);
    return response.status !== 404; // Any response except 404 is good
  } catch (error) {
    return false;
  }
}

/**
 * Start the app server
 */
function startAppServer() {
  return new Promise((resolve, reject) => {
    console.log(yellow('Starting app server...'));
    
    serverProcess = exec('npm run dev');
    
    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString().trim());
      
      // Check if server has started
      if (data.includes('ready started server') || data.includes('localhost:3000')) {
        isAppRunning = true;
        console.log(green('✅ App server started successfully'));
        resolve(true);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    // Set a timeout
    setTimeout(() => {
      if (!isAppRunning) {
        console.log(yellow('Server taking too long to start. Continuing anyway...'));
        resolve(false);
      }
    }, 30000);
  });
}

// Run the test suite
main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
}); 