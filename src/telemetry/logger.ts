import { sdk } from './open-telemetry.js';
import { trace, context } from '@opentelemetry/api';
import type { Logger, LogMethod } from 'winston';

// Create a default logger that will be replaced once initialization is complete
let winston = await import('winston');
let logger: Logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});
let originalLog: LogMethod = logger.log;

// Initialize logger with OpenTelemetry
const initializeLogger = async () => {
    try {
        // Start SDK before reinitializing winston
        await sdk.start();

        // Create full logger instance
        logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({filename: 'error.log', level: 'error'}),
                new winston.transports.File({filename: 'combined.log'}),
                new winston.transports.Console(),
            ],
        });

        originalLog = logger.log;

        // Set up the instrumented log function
        logger.log = function(this: Logger, level: string, message: string, ...meta: any[]): Logger {
            const activeSpan = trace.getSpan(context.active());
            if(activeSpan) {
                const traceId = activeSpan.spanContext().traceId;
                originalLog.call(this, level, `${message}, [traceId: ${traceId}]`, ...(meta as []));
            } else {
                originalLog.call(this, level, message, ...(meta as []));
            }
            return this;
        } as LogMethod;

        return logger;
    } catch (error) {
        console.error('Failed to initialize OpenTelemetry:', error);
        // Continue with basic logging if OpenTelemetry fails
        return logger;
    }
};

// Start initialization immediately
initializeLogger().catch(error => {
    console.error('Logger initialization failed:', error);
});

// Export both the logger instance and the initialization function
export { logger, initializeLogger };