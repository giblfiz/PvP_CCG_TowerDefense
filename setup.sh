#!/bin/bash

# Exit on error
set -e

# Install exact versions of packages
npm install --no-package-lock \
  eslint@9.25.1 \
  jest@29.7.0

echo "Setup complete. You can now run:"
echo "npm run test - to run tests"
echo "npm run lint - to run linting"