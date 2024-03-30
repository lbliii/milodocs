#!/bin/bash

# Configurable options
PRODUCT_VERSIONS="prod1, prod2, prod3, all" # Add or remove product versions as needed

# Usage message
USAGE="Usage: sh product.sh [${PRODUCT_VERSIONS}]"

## Pass in one of the specified product versions to this script to start the Hugo server with that version.
## e.g., sh product.sh prod1

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "No product scope specified; only use this command to build a limited documentation set."
    echo "-- ${USAGE}"
    echo "-- To build all documentation, use the standard hugo cli commands (hugo, hugo server)"
    exit 1
fi

# Check if the provided argument is a valid product version
if ! [[ "${PRODUCT_VERSIONS}" =~ (^|[[:space:]])"$1"($|[[:space:]]) ]]; then
    echo "Invalid product version specified."
    echo "-- ${USAGE}"
    exit 1
fi

# If $1 is all or ALL, do not set the HUGO_ORG environment variable
if [ $1 = "all" ] || [ $1 = "ALL" ]; then
    echo "Starting Hugo server for all Docs"
    hugo server
    exit 0
else 
    # Set the HUGO_ORG environment variable for other valid product versions
    export HUGO_PRODUCT=$1
    export HUGO_TITLE="$1 Docs"

    echo "Starting Hugo server for $HUGO_PRODUCT Docs"
    hugo server
fi
