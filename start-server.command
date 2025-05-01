#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$DIR"

# Display welcome message
echo "Starting Phaser Demo Server..."
echo "The server will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server when finished"
echo ""

# Create a simple HTTP server using Python
# We use Python's built-in HTTP server since it's commonly available on macOS
python3 -m http.server 3000 || python -m SimpleHTTPServer 3000

# Keep the terminal window open after the server stops
echo ""
echo "Server stopped. Press any key to close this window."
read -n 1