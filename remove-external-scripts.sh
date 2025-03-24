#!/bin/bash

# This script removes external script tags for GSAP, ScrollTrigger, and Split-Type 
# since they're now handled by script-loader.js

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Remove the external script tags
  # GSAP
  sed -i '' '/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/gsap\/3.12.4\/gsap.min.js"><\/script>/d' "$file"
  # ScrollTrigger
  sed -i '' '/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/gsap\/3.12.4\/ScrollTrigger.min.js"><\/script>/d' "$file"
  # Split-Type
  sed -i '' '/<script src="https:\/\/unpkg.com\/split-type"><\/script>/d' "$file"
  # Webflow.js
  sed -i '' '/<script src="js\/webflow.js" type="text\/javascript"><\/script>/d' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Removed external script tags from $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  No external script tags found in $file or couldn't be removed"
    # Restore original if no changes were made
    mv "${file}.bak" "$file"
    continue
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Removed external script tags from $MODIFIED_COUNT files." 