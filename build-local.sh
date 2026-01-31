#!/bin/bash

# Build script for Answer24 Frontend
# This script builds the application locally for production deployment

set -e  # Exit on any error

echo "🚀 Starting Answer24 Frontend Build Process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Run type checking
echo "🔍 Running type checking..."
npx tsc --noEmit

# Run linting
echo "🔧 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Check if out directory exists
    if [ -d "out" ]; then
        echo "📁 Build output directory created: out/"
        echo "📊 Build size:"
        du -sh out/
        
        echo "🌐 Static files ready for deployment!"
        echo "📋 Next steps:"
        echo "1. Upload the contents of the 'out' directory to your web server"
        echo "2. Make sure your server is configured to serve static files"
        echo "3. Set up proper routing for SPA (Single Page Application)"
        
        # List some key files
        echo "🔍 Key files in build output:"
        ls -la out/ | head -10
    else
        echo "❌ Build output directory not found!"
        echo "This might indicate an issue with the static export configuration."
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
