#!/bin/bash

# This script removes jQuery references from all HTML files in the directory

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Remove the jQuery script tag (multi-line)
  sed -i '' '/<script.*d3e54v103j8qbb.cloudfront.net\/js\/jquery-3.5.1.min.dc5e7f18c8.js/,/<\/script>/d' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Removed jQuery from $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  No jQuery reference found in $file or couldn't be removed"
    # Restore original if no changes were made
    mv "${file}.bak" "$file"
    continue
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Removed jQuery from $MODIFIED_COUNT files." 