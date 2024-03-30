#!/bin/bash

OUTPUT_NAME="offline-docs"
# USAGE="Usage: sh build-offline-site.sh [draft]"

# This script is for building offline html file:// protocol supported documentation as a .tar.gz for customers that use air-gapped environments. 
# It is not intended for live hosted sites.

if [ $1 = "draft" ]; then

    echo "Building Hugo site with drafts"
    hugo -D --environment development --config config/offline.yaml --minify
else

    echo "Building Hugo site without drafts"
    hugo --environment development --config config/offline.yaml --minify
fi

tar -czvf $OUTPUT_NAME.tar.gz ./public
# delete the public folder
rm -rf ./public


