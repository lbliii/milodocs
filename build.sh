#!/bin/bash

# Build script for cloud deployments (Vercel, Netlify, etc.)
# This script sets up the theme properly for cloud environments

set -e

echo "Setting up theme for cloud deployment..."

# Navigate to exampleSite directory
cd exampleSite

# Create themes directory if it doesn't exist
mkdir -p themes

# Remove existing symlink/directory if it exists
rm -rf themes/milodocs

# Create symlink to parent directory (the actual theme)
ln -sf ../../ themes/milodocs

echo "Theme setup complete. Starting Hugo build..."

# Build the site
hugo --environment production --minify

echo "Build complete!"