#!/bin/bash

# Install PWA dependencies
npm install -D vite-plugin-pwa @vite-pwa/assets-generator

# Create PWA assets directory
mkdir -p public/pwa-assets

# Create a simple PWA icon (this is a placeholder, you should replace with your own icons)
echo "Creating placeholder PWA icons..."
cat > public/pwa-192x192.png << EOL
iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABDSURBVHgB7cExAQAAAMKg9U9tCU+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG5qomcAAVkvZXoAAAAASUVORK5CYII=
EOL

cat > public/pwa-512x512.png << EOL
iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABDSURBVHgB7cExAQAAAMKg9U9tCU+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG5qomcAAVkvZXoAAAAASUVORK5CYII=
EOL

echo "PWA setup completed. You should replace the placeholder icons with your own."
echo "Run 'npm run dev' to start the development server."
