#!/bin/bash

# This script adds the Vimeo Player API script to the remaining HTML files that weren't updated automatically

# Files that need to be fixed
FILES=("index.html" "404.html" "year-of-the-rabbit.html")

# Loop through each file
for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Check if Vimeo API script is already included
  if grep -q "player.vimeo.com/api/player.js" "$file"; then
    echo "  Vimeo API script already exists in $file"
    continue
  fi
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Try alternative method: Add Vimeo API script before the script-loader.js
  sed -i '' '/<script src="js\/script-loader.js"><\/script>/i \
  <script src="https://player.vimeo.com/api/player.js"></script>' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Added Vimeo API script to $file"
  else
    echo "  Couldn't add Vimeo API script to $file using alternative method"
    # Restore original
    mv "${file}.bak" "$file"
    
    # Try a different approach - add it after a specific script
    cp "$file" "${file}.bak"
    sed -i '' '/<script src="js\/webflow.js" type="text\/javascript"><\/script>/a \
    <script src="https://player.vimeo.com/api/player.js"></script>' "$file"
    
    # Check if file was modified with this method
    if ! diff -q "$file" "${file}.bak" > /dev/null; then
      echo "  Added Vimeo API script to $file using second method"
    else
      echo "  Failed to add Vimeo API script to $file automatically"
      # Restore original
      mv "${file}.bak" "$file"
      continue
    fi
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done fixing remaining files!" 