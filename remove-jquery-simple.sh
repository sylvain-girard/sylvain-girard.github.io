#!/bin/bash

# This script removes jQuery references from all HTML files in the directory

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Look for jQuery references
  JQUERY_LINES=$(grep -n "jquery-3.5.1.min.dc5e7f18c8.js" "$file" | cut -d ':' -f 1)
  
  if [ -z "$JQUERY_LINES" ]; then
    echo "  No jQuery references found in $file"
    continue
  fi
  
  # For each jQuery reference found
  for line in $JQUERY_LINES; do
    echo "  Found jQuery reference at line $line"
    
    # Determine the start and end lines of the script tag
    START_LINE=$line
    while [ $START_LINE -gt 1 ] && ! grep -q "<script" <(sed -n "${START_LINE}p" "$file"); do
      START_LINE=$((START_LINE - 1))
    done
    
    END_LINE=$line
    while [ $END_LINE -lt $(wc -l < "$file") ] && ! grep -q "</script>" <(sed -n "${END_LINE}p" "$file"); do
      END_LINE=$((END_LINE + 1))
    done
    
    echo "  Script tag spans lines $START_LINE to $END_LINE"
    
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Remove the script tag
    sed -i '' "${START_LINE},${END_LINE}d" "$file"
    
    echo "  Removed jQuery script tag"
  done
done

echo "Done! Processed all files." 