#!/bin/bash

# ZenReader Chrome Extension Pack Script
# Usage: ./pack.sh [--version <version>]

set -e

# Check if zip is installed
if ! command -v zip &> /dev/null; then
    echo "Error: 'zip' command not found. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt install zip"
    echo "  macOS: brew install zip"
    exit 1
fi

# Get version from manifest or command line argument
VERSION=""
if [ "$1" = "--version" ] && [ -n "$2" ]; then
    VERSION="$2"
elif [ -f "manifest.json" ]; then
    VERSION=$(grep -o '"version": *"[^"]*"' manifest.json | head -1 | sed 's/.*: *"\([^"]*\)"/\1/')
fi

# Extension directory and output file
EXT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$EXT_DIR"

if [ -n "$VERSION" ]; then
    OUTPUT="ZenReader-${VERSION}.zip"
else
    OUTPUT="ZenReader.zip"
fi

# Files and directories to include
FILES=(
    manifest.json
    background/
    content/
    popup/
    styles/
    icons/
)

echo "Packing ZenReader Chrome Extension..."
echo "Output: $OUTPUT"

# Create zip file (excluding .git, .DS_Store, .md, pack.sh)
zip -r "$OUTPUT" "${FILES[@]}" \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "*.md" \
    -x "pack.sh"

echo "Done! Extension packed to: $OUTPUT"
