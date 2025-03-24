#!/bin/bash

# This script adds the script loader to all HTML files in the directory

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Check if script loader is already added
  if grep -q "script-loader.js" "$file"; then
    echo "  Script loader already exists in $file"
  else
    # Add script loader before closing body tag
    sed -i '' 's|</body>|  <!-- Add the script loader -->\n  <script src="js/script-loader.js"></script>\n</body>|g' "$file"
    echo "  Added script loader to $file"
  fi
done

echo "Done!" 