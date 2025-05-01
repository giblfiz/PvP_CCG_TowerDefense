/**
 * ServerLogger - A class for logging events to the server
 * Makes HTTP requests to the server's logging endpoint
 */
class ServerLogger {
    constructor(options = {}) {
        this.options = {
            endpoint: options.endpoint || '/api/log',
            enabled: options.enabled !== undefined ? options.enabled : true,
            logToConsole: options.logToConsole !== undefined ? options.logToConsole : true,
            batchInterval: options.batchInterval || 3000, // ms - longer interval to reduce load
            maxBatchSize: options.maxBatchSize || 50, // larger batch size for efficiency
            contextInfo: options.contextInfo || {}
        };
        
        this.pendingLogs = [];
        this.batchTimerId = null;
        
        // Start batch processing if enabled
        if (this.options.enabled) {
            this.startBatchProcessing();
        }
        
        console.log('ServerLogger initialized', this.options);
    }
    
    /**
     * Log a message with a specific level
     * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
     * @param {string|object} message - The message to log
     * @param {object} data - Additional data to include
     */
    log(level, message, data = {}) {
        if (!this.options.enabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message: typeof message === 'object' ? JSON.stringify(message) : message,
            data: { ...data },
            context: { ...this.options.contextInfo }
        };
        
        // Add to pending logs
        this.pendingLogs.push(logEntry);
        
        // Log to console if enabled
        if (this.options.logToConsole) {
            const consoleMethod = level.toLowerCase() === 'error' ? 'error' :
                                 level.toLowerCase() === 'warn' ? 'warn' :
                                 level.toLowerCase() === 'debug' ? 'debug' : 'log';
            console[consoleMethod](`[ServerLogger] ${level.toUpperCase()}: ${logEntry.message}`, data);
        }
        
        // If we've reached the max batch size, flush immediately
        if (this.pendingLogs.length >= this.options.maxBatchSize) {
            this.flushLogs();
        }
    }
    
    /**
     * Log an info message
     * @param {string|object} message - The message to log
     * @param {object} data - Additional data to include
     */
    info(message, data = {}) {
        this.log('INFO', message, data);
    }
    
    /**
     * Log a warning message
     * @param {string|object} message - The message to log
     * @param {object} data - Additional data to include
     */
    warn(message, data = {}) {
        this.log('WARN', message, data);
    }
    
    /**
     * Log an error message
     * @param {string|object} message - The message to log
     * @param {object} data - Additional data to include
     */
    error(message, data = {}) {
        this.log('ERROR', message, data);
    }
    
    /**
     * Log a debug message
     * @param {string|object} message - The message to log
     * @param {object} data - Additional data to include
     */
    debug(message, data = {}) {
        this.log('DEBUG', message, data);
    }
    
    /**
     * Set context information that will be included with all logs
     * @param {object} contextInfo - Context information to include
     */
    setContextInfo(contextInfo) {
        this.options.contextInfo = { ...contextInfo };
    }
    
    /**
     * Add context information to the existing context
     * @param {object} contextInfo - Context information to add
     */
    addContextInfo(contextInfo) {
        this.options.contextInfo = { ...this.options.contextInfo, ...contextInfo };
    }
    
    /**
     * Enable or disable logging
     * @param {boolean} enabled - Whether logging is enabled
     */
    setEnabled(enabled) {
        this.options.enabled = enabled;
        
        if (enabled && !this.batchTimerId) {
            this.startBatchProcessing();
        } else if (!enabled && this.batchTimerId) {
            this.stopBatchProcessing();
            // Flush any pending logs
            this.flushLogs();
        }
    }
    
    /**
     * Start batch processing of logs
     */
    startBatchProcessing() {
        if (this.batchTimerId) return;
        
        this.batchTimerId = setInterval(() => {
            this.flushLogs();
        }, this.options.batchInterval);
    }
    
    /**
     * Stop batch processing of logs
     */
    stopBatchProcessing() {
        if (this.batchTimerId) {
            clearInterval(this.batchTimerId);
            this.batchTimerId = null;
        }
    }
    
    /**
     * Flush pending logs to the server
     */
    flushLogs() {
        if (this.pendingLogs.length === 0) return;
        
        const logsToSend = [...this.pendingLogs];
        this.pendingLogs = [];
        
        // Send logs to server
        this.sendLogsToServer(logsToSend);
    }
    
    /**
     * Send logs to the server
     * @param {Array} logs - Array of log entries to send
     */
    sendLogsToServer(logs) {
        const payload = {
            logs: logs,
            batchSize: logs.length
        };
        
        fetch(this.options.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .catch(error => {
            console.error('Error sending logs to server:', error);
            // Put logs back in the queue if we failed to send them
            this.pendingLogs = [...logs, ...this.pendingLogs].slice(0, 100); // Limit queue size
        });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerLogger;
}