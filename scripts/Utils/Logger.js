// Logger.js - Client-side logger avec buffer et flush automatique
export class Logger {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.buffer = [];
        this.sessionId = this.generateSessionId();
        this.maxBufferSize = 50;
        this.flushInterval = 5000; // 5 secondes

        this.startFlushInterval();
        console.log(`📊 [Logger] Initialized with sessionId: ${this.sessionId}`);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    startFlushInterval() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    /**
     * Log an entry
     * @param {string} level - DEBUG, INFO, WARN, ERROR, CRITICAL
     * @param {string} category - HARVESTABLE, MOB, PLAYER, etc.
     * @param {string} event - Event name
     * @param {Object} data - Event data
     * @param {Object} context - Additional context
     */
    log(level, category, event, data, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            event,
            data,
            context: {
                ...context,
                sessionId: this.sessionId
            }
        };

        this.buffer.push(logEntry);

        // Flush si le buffer est plein
        if (this.buffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }

    /**
     * Convenience methods
     */
    debug(category, event, data, context) {
        this.log('DEBUG', category, event, data, context);
    }

    info(category, event, data, context) {
        this.log('INFO', category, event, data, context);
    }

    warn(category, event, data, context) {
        this.log('WARN', category, event, data, context);
    }

    error(category, event, data, context) {
        this.log('ERROR', category, event, data, context);
    }

    critical(category, event, data, context) {
        this.log('CRITICAL', category, event, data, context);
    }

    /**
     * Flush buffer to server
     */
    flush() {
        if (this.buffer.length === 0) return;

        if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
            try {
                this.wsClient.send(JSON.stringify({
                    type: 'logs',
                    logs: this.buffer
                }));
                console.log(`📤 [Logger] Flushed ${this.buffer.length} logs to server`);
                this.buffer = [];
            } catch (error) {
                console.error('❌ [Logger] Error flushing logs:', error);
            }
        } else {
            console.warn('⚠️ [Logger] WebSocket not ready, keeping logs in buffer');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush(); // Flush final
        console.log('📊 [Logger] Destroyed');
    }
}

