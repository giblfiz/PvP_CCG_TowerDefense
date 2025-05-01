#!/bin/bash

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$DIR"

# Make sure the log directory exists
mkdir -p logs

# Make sure we have the right permissions
chmod +x "$0"

# Echo instructions
echo "==================================="
echo "Tower Defense Game Server Launcher"
echo "==================================="
echo ""
echo "Starting server on port 3000..."
echo "When the server is running, open: http://localhost:3000/"
echo "View logs at: http://localhost:3000/logs"
echo ""
echo "To enable server logging from the browser, open the developer console and type:"
echo "window.enableServerLogging()"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==================================="

# Run the server
node server.js

# Keep the terminal window open on error
if [ $? -ne 0 ]; then
  echo "Server exited with an error. Press Enter to close this window."
  read
fi