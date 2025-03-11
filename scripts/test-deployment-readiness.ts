#!/usr/bin/env ts-node
/**
 * Deployment Readiness Test Script
 * 
 * This script tests various components of the application to verify they're working correctly
 * before deployment. It checks database connectivity, authentication, and core features.
 * 
 * Run with: npx ts-node scripts/test-deployment-readiness.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Color output for console
const green = (text: string) => `\x1b[32m${text}\x1b[0m`
const red = (text: string) => `\x1b[31m${text}\x1b[0m`
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`

// Environment variables validation
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY'
]

const optionalVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_VERCEL_URL'
]

async function main() {
  console.log(blue(bold('🔍 Deployment Readiness Test\n')))
  
  // Check environment variables
  console.log(yellow('Checking environment variables...'))
  let missingVars = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  if (missingVars.length > 0) {
    console.log(red(`❌ Missing required environment variables: ${missingVars.join(', ')}`))
    console.log(red('   Please add these to your .env file before deploying.'))
  } else {
    console.log(green('✅ All required environment variables are set'))
  }
  
  let warningVars = []
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warningVars.push(varName)
    }
  }
  
  if (warningVars.length > 0) {
    console.log(yellow(`⚠️  Missing optional environment variables: ${warningVars.join(', ')}`))
    console.log(yellow('   Consider adding these if you need the related functionality.'))
  } else {
    console.log(green('✅ All optional environment variables are set'))
  }
  
  console.log('')
  
  // Test Supabase connection
  console.log(yellow('Testing Supabase connection...'))
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log(red('❌ Missing Supabase credentials'))
    return
  }
  
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
  
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log(red(`❌ Supabase connection error: ${error.message}`))
    } else {
      console.log(green('✅ Supabase connection successful'))
    }
  } catch (err) {
    console.log(red(`❌ Supabase connection failed: ${err}`))
  }
  
  console.log('')
  
  // Check required database tables
  console.log(yellow('Checking database tables...'))
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
  ]
  
  let missingTables = []
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        missingTables.push(table)
        console.log(red(`❌ Table '${table}' error: ${error.message}`))
      } else {
        console.log(green(`✅ Table '${table}' exists`))
      }
    } catch (err) {
      missingTables.push(table)
      console.log(red(`❌ Error checking table '${table}': ${err}`))
    }
  }
  
  console.log('')
  
  if (missingTables.length > 0) {
    console.log(red(`❌ Missing required tables: ${missingTables.join(', ')}`))
    console.log(red('   Please run the database setup scripts before deploying.'))
  } else {
    console.log(green('✅ All required database tables exist'))
  }
  
  // Show summary
  console.log('\n' + blue(bold('📋 Deployment Readiness Summary:')))
  
  if (missingVars.length > 0 || missingTables.length > 0) {
    console.log(red('❌ The application is NOT ready for deployment.'))
    console.log(red('   Please fix the issues above before proceeding.'))
  } else if (warningVars.length > 0) {
    console.log(yellow('⚠️  The application is MOSTLY ready for deployment.'))
    console.log(yellow('   Review the warnings above before proceeding.'))
  } else {
    console.log(green('✅ The application is READY for deployment!'))
  }
}

main().catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
}) 