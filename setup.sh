#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please update the .env file with your Supabase and OpenAI API keys."
fi

# Run the PWA setup script
echo "Setting up PWA capabilities..."
./setup-pwa.sh

echo "Setup complete! You can now run the development server with:"
echo "npm run dev"
