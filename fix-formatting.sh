#!/bin/bash

# This script fixes the formatting issue where the Vimeo API script and the script loader are on the same line

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Fix the formatting issue by replacing the pattern with line breaks
  sed -i '' 's|<script src="https://player.vimeo.com/api/player.js"></script>    <script src="js/script-loader.js"></script>|<script src="https://player.vimeo.com/api/player.js"></script>\n    <script src="js/script-loader.js"></script>|g' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Fixed formatting in $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  No formatting issues found in $file"
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Fixed formatting in $MODIFIED_COUNT files." 