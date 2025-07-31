#!/bin/bash

# Build script for cloud deployments (Vercel, Netlify, etc.)
# This script sets up dependencies and theme properly for cloud environments

set -e

echo "Setting up dependencies and theme for cloud deployment..."

# Navigate to exampleSite directory
cd exampleSite

echo "Installing Ruby dependencies..."
# Install Ruby gems using bundler
if [ -f "Gemfile" ]; then
    # Install gems to vendor/bundle for better isolation
    bundle install --path vendor/bundle --deployment 2>/dev/null || bundle install --path vendor/bundle
    
    # Add bundler bin to PATH
    export PATH="$(pwd)/vendor/bundle/bin:$PATH"
    export GEM_PATH="$(pwd)/vendor/bundle:$GEM_PATH"
fi

echo "Installing Python dependencies..."
# Install Python dependencies
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt --user --break-system-packages 2>/dev/null || pip3 install -r requirements.txt --user
    
    # Add Python user bin to PATH
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "Setting up Hugo theme..."
# Create themes directory if it doesn't exist
mkdir -p themes

# Remove existing symlink/directory if it exists
rm -rf themes/milodocs

# Create symlink to parent directory (the actual theme)
ln -sf ../../ themes/milodocs

echo "Verifying dependencies..."
# Check if asciidoctor is available
if command -v bundle >/dev/null 2>&1; then
    echo "✓ Bundler available"
    if bundle exec asciidoctor --version >/dev/null 2>&1; then
        echo "✓ asciidoctor available via bundler"
    else
        echo "⚠ asciidoctor not found via bundler"
    fi
else
    echo "⚠ Bundler not available"
fi

# Check if rst2html is available
if command -v rst2html >/dev/null 2>&1; then
    echo "✓ rst2html available"
elif command -v rst2html.py >/dev/null 2>&1; then
    echo "✓ rst2html.py available"
else
    echo "⚠ rst2html not found in PATH"
fi

echo "Starting Hugo build..."

# Build the site with bundler exec to ensure gem path is correct
if command -v bundle >/dev/null 2>&1; then
    bundle exec hugo --environment production --minify
else
    hugo --environment production --minify
fi

echo "Build complete!"