#!/bin/bash

# This script removes the Slater app script code from all HTML files in the directory

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Remove the Slater app script block (comment and script tag)
  # Using sed to match the pattern from the comment to the end of the script tag
  sed -i '' '/<!-- 🤙 https:\/\/slater.app\/6852.js -->/,/<\/script>/d' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Removed Slater app code from $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  No Slater app code found in $file"
    # Restore original if no changes were made
    mv "${file}.bak" "$file"
    continue
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Removed Slater app code from $MODIFIED_COUNT files." 