#!/usr/bin/env node
/**
 * Production Preparation Script
 * 
 * This script helps prepare the application for production deployment by:
 * 1. Updating package dependencies to use real packages instead of mocks
 * 2. Checking for development-only code
 * 3. Verifying environment variables
 * 
 * Run with: node scripts/prepare-for-production.js
 * 
 * Options:
 * --auto-confirm: Skip confirmation prompts (useful for CI/CD)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output for console
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

// Parse command line arguments
const args = process.argv.slice(2);
const autoConfirm = args.includes('--auto-confirm');

async function main() {
  console.log(blue(bold('🚀 Preparing App for Production\n')));
  
  // Check package.json for mock dependencies
  console.log(yellow('Checking for mock dependencies in package.json...'));
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let needsUpdate = false;
    
    // Check for perplexity-ai mock
    if (packageJson.dependencies && packageJson.dependencies['perplexity-ai'] && 
        packageJson.dependencies['perplexity-ai'].includes('file:')) {
      console.log(yellow('Found mock perplexity-ai dependency'));
      
      // Check if perplexity-sdk is already installed
      if (!packageJson.dependencies['perplexity-sdk']) {
        console.log(yellow('perplexity-sdk not found, will install it'));
        needsUpdate = true;
      } else {
        console.log(green('perplexity-sdk is already installed'));
      }
      
      // Ask for confirmation, unless auto-confirm is enabled
      let shouldProceed = autoConfirm;
      
      if (!autoConfirm) {
        console.log('');
        console.log(yellow('⚠️  We need to replace the mock perplexity-ai with the real SDK for production'));
        console.log(yellow('This will run the following commands:'));
        console.log('1. npm uninstall perplexity-ai');
        console.log('2. npm install perplexity-sdk --save (if not already installed)');
        console.log('3. Update imports in your code (you may need to do this manually)');
        
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise((resolve) => {
          rl.question('\nDo you want to proceed? (y/n): ', (answer) => {
            resolve(answer.toLowerCase());
            rl.close();
          });
        });
        
        shouldProceed = (answer === 'y' || answer === 'yes');
      } else {
        console.log(yellow('Auto-confirm enabled. Proceeding without confirmation...'));
      }
      
      if (shouldProceed) {
        // Perform the updates
        console.log(yellow('\nRemoving mock perplexity-ai...'));
        execSync('npm uninstall perplexity-ai', { stdio: 'inherit' });
        
        if (needsUpdate) {
          console.log(yellow('\nInstalling perplexity-sdk...'));
          execSync('npm install perplexity-sdk --save', { stdio: 'inherit' });
        }
        
        console.log(green('\n✅ Dependencies updated successfully!'));
        console.log(yellow('\nNote: You may need to update your imports from:'));
        console.log('import { search } from "perplexity-ai";');
        console.log('\nTo:');
        console.log('import Perplexity from "perplexity-sdk";');
        console.log('const perplexity = new Perplexity({ apiKey: process.env.PERPLEXITY_API_KEY }).client();');
      } else {
        console.log(yellow('\nOperation cancelled. No changes were made.'));
      }
    } else if (!packageJson.dependencies['perplexity-ai'] && !packageJson.dependencies['perplexity-sdk']) {
      console.log(red('Neither perplexity-ai nor perplexity-sdk found in dependencies'));
      console.log(yellow('Installing perplexity-sdk...'));
      execSync('npm install perplexity-sdk --save', { stdio: 'inherit' });
      console.log(green('✅ perplexity-sdk installed successfully!'));
    } else if (packageJson.dependencies['perplexity-sdk']) {
      console.log(green('✅ Using real perplexity-sdk package. Good to go!'));
    } else {
      console.log(green('✅ No mock dependencies found. Good to go!'));
    }
  } catch (err) {
    console.error(red(`Error updating package.json: ${err.message}`));
    process.exit(1);
  }
  
  // Run deployment checks
  console.log(yellow('\nRunning deployment readiness checks...'));
  try {
    execSync('node scripts/deploy.js', { stdio: 'inherit' });
  } catch (err) {
    console.error(red(`Error running deployment checks: ${err.message}`));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(red(`Error preparing for production: ${err.message}`));
  process.exit(1);
}); 