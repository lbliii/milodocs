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
python3 --version 2>/dev/null || echo "python3 not found"
python --version 2>/dev/null || echo "python not found"
pip3 --version 2>/dev/null || echo "pip3 not found"
pip --version 2>/dev/null || echo "pip not found"
ruby --version 2>/dev/null || echo "ruby not found"
bundle --version 2>/dev/null || echo "bundle not found"

# Install Python dependencies (for RST support)
if [ -f "requirements.txt" ]; then
    echo "Found requirements.txt, installing Python dependencies..."
    # Try pip3 first, then pip
    if command -v pip3 >/dev/null 2>&1; then
        echo "Using pip3..."
        pip3 install -r requirements.txt
    elif command -v pip >/dev/null 2>&1; then
        echo "Using pip..."
        pip install -r requirements.txt
    else
        echo "Neither pip3 nor pip found, skipping Python dependencies"
    fi
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
echo "Creating symlink from $(pwd)/themes/milodocs to $(pwd)/../"
ln -sf ../ themes/milodocs

# Verify the symlink was created correctly
echo "Checking symlink:"
ls -la themes/
echo "Checking if theme files are accessible:"
if [ -d "themes/milodocs/layouts" ]; then
    echo "✓ layouts directory found"
    ls -la themes/milodocs/layouts/ | head -5
else
    echo "✗ layouts directory NOT found"
    echo "Contents of themes/milodocs:"
    ls -la themes/milodocs/ || echo "Failed to list themes/milodocs"
fi

if [ -f "themes/milodocs/layouts/shortcodes/prod.html" ]; then
    echo "✓ prod.html shortcode found"
else
    echo "✗ prod.html shortcode NOT found"
    echo "Symlink failed, trying copy approach..."
    
    # Remove broken symlink
    rm -rf themes/milodocs
    
    # Check if parent directory has theme files
    echo "Checking parent directory for theme files:"
    ls -la ../ | head -10
    
    if [ -d "../layouts" ]; then
        echo "Found theme files in parent directory, copying instead of symlinking..."
        mkdir -p themes/milodocs
        
        # Copy all theme directories
        cp -r ../layouts themes/milodocs/
        cp -r ../assets themes/milodocs/ 2>/dev/null || echo "No assets directory to copy"
        cp -r ../static themes/milodocs/ 2>/dev/null || echo "No static directory to copy"
        
        # Copy theme configuration files if they exist
        cp ../theme.toml themes/milodocs/ 2>/dev/null || echo "No theme.toml to copy"
        cp ../hugo.toml themes/milodocs/ 2>/dev/null || echo "No hugo.toml to copy"
        
        echo "Theme files copied successfully"
        
        # Check if copy worked
        if [ -f "themes/milodocs/layouts/shortcodes/prod.html" ]; then
            echo "✓ Copy approach successful - prod.html found"
        else
            echo "✗ Copy approach failed - prod.html still not found"
        fi
    else
        echo "✗ No theme files found in parent directory"
        echo "Contents of parent directory:"
        ls -la ../
    fi
fi

echo "Theme setup complete. Starting Hugo build..."

# Build the site
hugo --environment production --minify

echo "Build complete!"