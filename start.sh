#!/bin/bash

# Navigate to the project directory
cd uhax-2026

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed."
fi

# Start the application
echo "Starting EduFlow AI..."
npm run dev
