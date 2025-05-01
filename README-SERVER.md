# Tower Defense Game - Server Launcher

## Quick Start

1. Double-click the `launch-server.command` file in Finder
   - This will open a Terminal window and start the server
   - You may need to right-click and select "Open" the first time due to macOS security

2. Once the server is running, open the game at:
   ```
   http://localhost:3000/
   ```

3. To enable server logging (optional, disabled by default):
   - Open the browser console (F12 or right-click > Inspect > Console)
   - Type: `window.enableServerLogging()`

4. View the logs at:
   ```
   http://localhost:3000/logs
   ```

5. To stop the server, press Ctrl+C in the Terminal window

## What is This?

The server provides:

1. A web server to run the game (avoids CORS issues)
2. A logging system to track debugging information
3. A log viewer to see what's happening in the game

## For Windows Users

If you're on Windows:
1. Make sure Node.js is installed
2. Open a Command Prompt in this directory
3. Run: `node server.js`
4. Open `http://localhost:3000/` in your browser

## Troubleshooting

- **Port already in use**: If port 3000 is already being used, edit `server.js` to change the port number
- **No logs appear**: Make sure you've enabled logging with `window.enableServerLogging()`
- **Server crashes**: Check the terminal for error messages