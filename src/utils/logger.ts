import winston from 'winston';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Only add file transports if not in test mode and logs directory is writable
    ...(config.nodeEnv !== 'test' && process.env.NODE_ENV !== 'test' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ] : []),
  ],
});

// Create logs directory only if needed and in production mode
if (config.nodeEnv !== 'test' && process.env.NODE_ENV !== 'test') {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (error) {
    // If we can't create logs directory, just log to console
    console.warn('Could not create logs directory, logging to console only');
  }
}
