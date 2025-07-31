#!/bin/bash

# Build script for cloud deployments (Vercel, Netlify, etc.)
# This script sets up the theme properly for cloud environments

set -e

# Navigate to exampleSite directory first
cd exampleSite

echo "Installing dependencies for markup renderers..."

# Debug: List current directory and files
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Check if required tools are available
echo "Checking available tools:"
which python3 || echo "python3 not found"
which pip3 || echo "pip3 not found"
which ruby || echo "ruby not found"
which bundle || echo "bundle not found"

# Install Python dependencies (for RST support)
if [ -f "requirements.txt" ]; then
    echo "Found requirements.txt, installing Python dependencies..."
    pip3 install -r requirements.txt
else
    echo "requirements.txt not found"
fi

# Install Ruby dependencies (for AsciiDoc support)
if [ -f "Gemfile" ]; then
    echo "Found Gemfile, installing Ruby dependencies..."
    bundle install
else
    echo "Gemfile not found"
fi

echo "Setting up theme for cloud deployment..."

# Create themes directory if it doesn't exist
mkdir -p themes

# Remove existing symlink/directory if it exists
rm -rf themes/milodocs

# Create symlink to parent directory (the actual theme)
# Since we're in exampleSite, the theme root is one level up
ln -sf ../ themes/milodocs

echo "Theme setup complete. Starting Hugo build..."

# Build the site
hugo --environment production --minify

echo "Build complete!"