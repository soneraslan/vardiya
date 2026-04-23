/**
 * Winston ile Merkezi Loglama Sistemi
 */
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'vardiya-sistemi' },
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

// Helper methods
logger.success = (msg, meta) => logger.info(`✅ ${msg}`, meta);
logger.warning = (msg, meta) => logger.warn(`⚠️ ${msg}`, meta);

module.exports = logger;