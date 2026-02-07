#!/bin/bash

# EduFlow AI - Fast Setup Script
# This script initializes the project environment on a new machine.

set -e  # Exit on error

echo "🚀 Starting EduFlow AI Setup..."

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo "✅ Node.js found: $NODE_VERSION"
fi

# 2. Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
else
    echo "✅ npm found"
fi

# 3. Navigate to project directory
cd uhax-2026

# 4. Install Project Dependencies
echo "📦 Installing project dependencies..."
npm install

# 5. Verify Build Environment
echo "🔍 Verifying build environment..."
npm run lint || echo "⚠️  Lint warnings detected (safe to ignore for setup)"

# 6. Setup Complete
echo "
🎉 Setup Complete!

To start the application:
  cd uhax-2026
  npm run dev

To build for production:
  cd uhax-2026
  npm run build
"

# Make start script executable
chmod +x ../start.sh
