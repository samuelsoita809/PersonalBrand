#!/bin/bash
echo "Building project..."
npm run build

echo "Running tests..."
npm run test

echo "Deploying to Vercel..."
# vercel --prod (Requires vercel CLI login)
