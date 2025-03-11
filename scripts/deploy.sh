#!/bin/bash

# Deployment Helper Script
# This script helps run deployment tests and checks for the trAIner fitness app

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print header
echo -e "\n${BLUE}${BOLD}🚀 trAIner Fitness App Deployment Helper${NC}\n"

# Check command line arguments
if [ "$1" = "test" ] || [ "$1" = "" ]; then
  echo -e "${YELLOW}Running deployment readiness tests...${NC}"
  node scripts/deploy.js
elif [ "$1" = "build" ]; then
  echo -e "${YELLOW}Building application for production...${NC}"
  npm run build
elif [ "$1" = "preview" ]; then
  echo -e "${YELLOW}Starting preview server...${NC}"
  npm run build && npm run start
elif [ "$1" = "prepare" ]; then
  echo -e "${YELLOW}Preparing application for production deployment...${NC}"
  node scripts/prepare-for-production.js
elif [ "$1" = "help" ]; then
  echo -e "${BLUE}${BOLD}Usage:${NC}"
  echo -e "  ${GREEN}./scripts/deploy.sh${NC} or ${GREEN}./scripts/deploy.sh test${NC} - Run deployment readiness tests"
  echo -e "  ${GREEN}./scripts/deploy.sh build${NC} - Build the application for production"
  echo -e "  ${GREEN}./scripts/deploy.sh preview${NC} - Build and start a production preview server"
  echo -e "  ${GREEN}./scripts/deploy.sh prepare${NC} - Prepare the application for production (fix dependencies)"
  echo -e "  ${GREEN}./scripts/deploy.sh help${NC} - Show this help message"
else
  echo -e "${RED}Unknown command: $1${NC}"
  echo -e "Use ${GREEN}./scripts/deploy.sh help${NC} to see available commands"
  exit 1
fi 