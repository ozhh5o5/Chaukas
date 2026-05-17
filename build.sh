#!/bin/bash

# Build script for Vercel deployment

echo "Building SankatSaathi for Vercel..."

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy frontend build to root for Vercel
echo "Copying frontend build..."
cp -r frontend/dist ./dist

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete!"