/**
 * @fileoverview Enhanced logging utility
 * @description Centralized logging with different levels and optional file output
 * @author Template Generator
 * @version 1.0.0
 */

const fs = require('fs')
const path = require('path')
const { config } = require('../config')

/**
 * Log levels with numeric values for comparison
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

/**
 * ANSI color codes for console output
 */
const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  http: '\x1b[35m', // Magenta
  verbose: '\x1b[34m', // Blue
  debug: '\x1b[32m', // Green
  silly: '\x1b[37m', // White
  reset: '\x1b[0m' // Reset
}

/**
 * Ensures the logs directory exists
 */
const ensureLogDir = () => {
  const logDir = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  return logDir
}

/**
 * Formats a log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString()
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`
}

/**
 * Writes log to file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const writeToFile = (level, message, meta = {}) => {
  if (config.server.environment === 'test') return // Don't write logs during testing

  try {
    const logDir = ensureLogDir()
    const logFile = path.join(logDir, 'app.log')
    const formattedMessage = formatMessage(level, message, meta)

    fs.appendFileSync(logFile, formattedMessage + '\n')
  } catch (error) {
    // Fallback to console if file writing fails
    // eslint-disable-next-line no-console
    console.error('Failed to write to log file:', error.message)
  }
}

/**
 * Main logger class
 */
class Logger {
  constructor () {
    this.level = config.logging.level || 'info'
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true'
  }

  /**
   * Checks if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} True if level should be logged
   */
  shouldLog (level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level]
  }

  /**
   * Generic log method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  log (level, message, meta = {}) {
    if (!this.shouldLog(level)) return

    const formattedMessage = formatMessage(level, message, meta)
    const coloredMessage = `${COLORS[level]}${formattedMessage}${COLORS.reset}`

    // Output to console
    // eslint-disable-next-line no-console
    console.log(coloredMessage)

    // Write to file if enabled
    if (this.enableFileLogging) {
      writeToFile(level, message, meta)
    }
  }

  /**
   * Error logging
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error (message, meta = {}) {
    this.log('error', message, meta)
  }

  /**
   * Warning logging
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn (message, meta = {}) {
    this.log('warn', message, meta)
  }

  /**
   * Info logging
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info (message, meta = {}) {
    this.log('info', message, meta)
  }

  /**
   * HTTP request logging
   * @param {string} message - HTTP message
   * @param {Object} meta - Additional metadata
   */
  http (message, meta = {}) {
    this.log('http', message, meta)
  }

  /**
   * Verbose logging
   * @param {string} message - Verbose message
   * @param {Object} meta - Additional metadata
   */
  verbose (message, meta = {}) {
    this.log('verbose', message, meta)
  }

  /**
   * Debug logging
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug (message, meta = {}) {
    this.log('debug', message, meta)
  }

  /**
   * Silly logging
   * @param {string} message - Silly message
   * @param {Object} meta - Additional metadata
   */
  silly (message, meta = {}) {
    this.log('silly', message, meta)
  }

  /**
   * Logs request details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logRequest (req, res) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: res.responseTime
    }

    this.http(`${req.method} ${req.originalUrl}`, meta)
  }

  /**
   * Logs errors with stack trace
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  logError (error, context = {}) {
    const meta = {
      ...context,
      stack: error.stack,
      name: error.name
    }

    this.error(error.message, meta)
  }
}

// Create singleton logger instance
const logger = new Logger()

module.exports = {
  logger,
  Logger,
  LOG_LEVELS,
  ensureLogDir
}
