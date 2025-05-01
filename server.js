const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'logs', 'game.log');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle log API endpoint
  if (pathname === '/api/log' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const logData = JSON.parse(body);
        const timestamp = new Date().toISOString();
        
        // Handle batch logging
        if (logData.logs && Array.isArray(logData.logs)) {
          const logEntries = logData.logs.map(entry => {
            const message = typeof entry.message === 'object' 
              ? JSON.stringify(entry.message) 
              : entry.message;
              
            const dataStr = entry.data && Object.keys(entry.data).length > 0
              ? ` | ${JSON.stringify(entry.data)}`
              : '';
              
            const contextStr = entry.context && Object.keys(entry.context).length > 0
              ? ` | Context: ${JSON.stringify(entry.context)}`
              : '';
              
            return `[${entry.timestamp || timestamp}] [${entry.level || 'INFO'}] ${message}${dataStr}${contextStr}\n`;
          }).join('');
          
          fs.appendFile(LOG_FILE, logEntries, (err) => {
            if (err) {
              console.error('Error writing batch logs to file:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Failed to write batch logs to file' }));
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, count: logData.logs.length }));
          });
        } 
        // Handle single log entry
        else {
          const message = typeof logData.message === 'object' 
            ? JSON.stringify(logData.message) 
            : logData.message;
            
          const logEntry = `[${timestamp}] [${logData.level || 'INFO'}] ${message}\n`;
          
          fs.appendFile(LOG_FILE, logEntry, (err) => {
            if (err) {
              console.error('Error writing to log file:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Failed to write to log file' }));
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          });
        }
      } catch (e) {
        console.error('Error processing log request:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid log data', details: e.message }));
      }
    });
    
    return;
  }
  
  // Handle log view endpoint
  if (pathname === '/logs') {
    // Get query parameters
    const query = parsedUrl.query;
    const lastLines = query.last ? parseInt(query.last) : 100; // Default to last 100 lines
    
    // Use tail command for efficiency with large log files
    const tailCmd = `tail -n ${lastLines} ${LOG_FILE}`;
    exec(tailCmd, (err, stdout, stderr) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error reading log file: ${err.message}\n${stderr}`);
        return;
      }
      
      // Create a simple HTML page with controls
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Game Logs</title>
        <style>
          body { font-family: monospace; background: #222; color: #eee; padding: 20px; }
          pre { white-space: pre-wrap; }
          .controls { position: fixed; top: 10px; right: 10px; background: #333; padding: 10px; border-radius: 5px; }
          button { padding: 5px 10px; margin: 2px; cursor: pointer; }
          .cleanup { color: #66ff66; }
          .error { color: #ff6666; }
          .warning { color: #ffcc66; }
        </style>
      </head>
      <body>
        <h1>Game Logs (Last ${lastLines} lines)</h1>
        <div class="controls">
          <button onclick="location.href='/logs?last=100'">Last 100</button>
          <button onclick="location.href='/logs?last=500'">Last 500</button>
          <button onclick="location.href='/logs?last=1000'">Last 1000</button>
          <button onclick="location.reload()">Refresh</button>
          <button onclick="clearLogs()">Clear Logs</button>
        </div>
        <pre id="logContent">${
          stdout
            .replace(/cleanup/gi, '<span class="cleanup">$&</span>')
            .replace(/ERROR/gi, '<span class="error">$&</span>')
            .replace(/WARNING/gi, '<span class="warning">$&</span>')
        }</pre>
        <script>
          function clearLogs() {
            if (confirm('Are you sure you want to clear all logs?')) {
              fetch('/clear-logs', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    document.getElementById('logContent').textContent = 'Logs cleared.';
                  } else {
                    alert('Error clearing logs: ' + data.error);
                  }
                });
            }
          }
          
          // Auto-refresh every 10 seconds
          setTimeout(() => location.reload(), 10000);
        </script>
      </body>
      </html>
      `;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    
    return;
  }
  
  // Handle clear logs endpoint
  if (pathname === '/clear-logs' && req.method === 'POST') {
    fs.writeFile(LOG_FILE, `Log file cleared at ${new Date().toISOString()}\n`, err => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    
    return;
  }
  
  // Handle static files
  if (pathname === '/') {
    pathname = '/phaser-map.html';
  }
  
  const filePath = path.join(__dirname, pathname.substr(1));
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`File ${pathname} not found`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

console.log(`Server running at http://localhost:${PORT}/`);
console.log(`View logs at http://localhost:${PORT}/logs`);
server.listen(PORT);