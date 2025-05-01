# Server Logging Setup for Tower Defense Game

This document explains how to use the server-based logging functionality to debug the game.

## Features

- Detailed logging of game events to a server-side log file
- Browser logs sent to server automatically when enabled
- Convenient web interface to view logs
- Batch processing of logs to reduce network overhead

## Setup Instructions

1. Make sure you have Node.js installed on your system

2. To launch the server, double-click the `Launch Server.app` file or run:
   ```bash
   node server.js
   ```
   from the project directory in Terminal

3. Open the game by navigating to:
   ```
   http://localhost:3000/
   ```

4. View the logs at:
   ```
   http://localhost:3000/logs
   ```

## Enabling Server Logging

Server logging is disabled by default to prevent performance issues. To enable it:

1. Open the browser's developer console (F12 or right-click > Inspect > Console)
2. Type the following command:
   ```javascript
   window.enableServerLogging()
   ```

3. To disable it again later:
   ```javascript
   window.disableServerLogging()
   ```

## How It Works

- The `src/ui/ServerLogger.js` file contains the client-side logging code
- `server.js` provides the server-side endpoints for receiving and displaying logs
- Logs are stored in `logs/game.log`
- The system automatically filters logs to include only relevant game events

## Debugging Mook Cleanup

The server logger is particularly useful for debugging the mook cleanup process:

1. Start the server and enable logging
2. Play through a wave of enemies
3. Click the "Force Cleanup" button
4. Check the server logs to see detailed information about the cleanup process

This helps identify issues with sprite removal, array filtering, and object lifecycle management.