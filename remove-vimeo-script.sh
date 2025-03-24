#!/bin/bash

# This script removes the inline Vimeo player script code from all HTML files in the directory

# Find all HTML files in the current directory
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Remove the Vimeo player script block
  # Using sed to match from the vimeo player script to the end of the script tag
  sed -i '' '/<script src="https:\/\/player.vimeo.com\/api\/player.js"><\/script>/,/<\/script>/d' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Removed Vimeo player code from $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  No Vimeo player code found or couldn't be removed in $file"
    # Restore original if no changes were made
    mv "${file}.bak" "$file"
    continue
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Removed Vimeo player code from $MODIFIED_COUNT files."

# Now, add the Vimeo Player API script reference to all HTML files
echo "Adding Vimeo Player API script reference to all HTML files..."

# Find all HTML files in the current directory again
HTML_FILES=$(find . -maxdepth 1 -name "*.html")

# Counter for modified files
MODIFIED_COUNT=0

# Loop through each HTML file
for file in $HTML_FILES; do
  echo "Processing $file for Vimeo API script..."
  
  # Check if Vimeo API script is already included
  if grep -q "player.vimeo.com/api/player.js" "$file"; then
    echo "  Vimeo API script already exists in $file"
    continue
  fi
  
  # Create a backup before making changes
  cp "$file" "${file}.bak"
  
  # Add Vimeo API script before the Lenis script or script-loader.js
  sed -i '' '/<script data-id-scroll="" data-autoinit="true"/i \
  <script src="https://player.vimeo.com/api/player.js"></script>' "$file"
  
  # Check if file was modified
  if ! diff -q "$file" "${file}.bak" > /dev/null; then
    echo "  Added Vimeo API script to $file"
    MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
  else
    echo "  Couldn't add Vimeo API script to $file"
    # Restore original if no changes were made
    mv "${file}.bak" "$file"
    continue
  fi
  
  # Remove backup file
  rm "${file}.bak"
done

echo "Done! Added Vimeo API script to $MODIFIED_COUNT files." 