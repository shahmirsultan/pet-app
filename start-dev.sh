#!/bin/sh

echo "========================================="
echo "Starting Pet Shop Development Build"
echo "========================================="

# Function to handle errors
handle_error() {
    echo "ERROR: $1"
    echo "Keeping container alive for debugging..."
    tail -f /dev/null
}

# Install dependencies (including devDependencies for build tools)
echo "Step 1: Installing dependencies..."
npm ci --include=dev || npm install --include=dev || handle_error "npm install failed"

# Build application
echo "Step 2: Building application..."
npm run build || handle_error "npm run build failed"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    handle_error "dist folder not created after build"
fi

# Start http-server
echo "Step 3: Starting HTTP server..."
echo "Application will be available on http://localhost:3000"
npx http-server dist -p 3000 || handle_error "http-server failed to start"
