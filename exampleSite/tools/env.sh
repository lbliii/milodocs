#!/bin/bash

# Configurable options
ENVIRONMENTS="production, development, offline, enterprise, opensource" # Add or remove environments as needed

# Usage message
USAGE="Usage: sh environment.sh [${ENVIRONMENTS}]"

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "No environment specified. Only use this command to start the hugo server with a specific config/{environment}.yaml file."
    echo "-- ${USAGE}"
    echo "-- To build all documentation, use the standard hugo cli commands (hugo, hugo server) and top-level hugo.yaml file"
    exit 1
fi

# Check if the provided argument is a valid environment
if ! [[ "${ENVIRONMENTS}" =~ (^|[[:space:],])"$1"($|[[:space:],]) ]]; then
    echo "Invalid environment specified."
    echo "-- ${USAGE}"
    exit 1
fi

# If $1 is all or ALL, do not set the HUGO_ORG environment variable
if [[ $1 == "all" ]] || [[ $1 == "ALL" ]]; then
    echo "Starting Hugo server for all Docs"
    hugo server
    exit 0
elif [[ $1 == "offline" ]]; then
    echo "Starting Hugo server for offline Docs"
    hugo server --config config/offline.yaml --environment offline
    exit 0
elif [[ $1 == "enterprise" ]]; then
    echo "Starting Hugo server for enterprise Docs"
    hugo server --config config/enterprise.yaml --environment enterprise
    exit 0
elif [[ $1 == "opensource" ]]; then
    echo "Starting Hugo server for opensource Docs"
    hugo server --config config/open-source.yaml --environment opensource
    exit 0
elif [[ $1 == "production" ]]; then
    echo "Starting Hugo server for production Docs"
    hugo server --environment production
    exit 0
elif [[ $1 == "development" ]]; then
    echo "Starting Hugo server for development Docs"
    hugo server --environment development
    exit 0
else
    # Set the HUGO_ORG environment variable for other valid environments
    export HUGO_PRODUCT=$1
    export HUGO_TITLE="$1 Docs"

    echo "Starting Hugo server for $HUGO_PRODUCT Docs"
    hugo server
fi
