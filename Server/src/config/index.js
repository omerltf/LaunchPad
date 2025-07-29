/* eslint-disable no-console */
/**
 * @fileoverview Application configuration module
 * @description Centralized configuration management with environment validation
 * @author Template Generator
 * @version 1.0.0
 */

const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

/**
 * Validates required environment variables
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} If any required variable is missing
 */
const validateRequiredEnvVars = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    )
  }
}

/**
 * Application configuration object
 * @description Contains all application settings with defaults and validation
 */
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET, // Remove fallback - make required
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // API Configuration
  api: {
    version: process.env.API_VERSION || '1.0.0',
    prefix: '/api',
    bodyLimit: '10mb'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'memory',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || null,
    database: process.env.DB_NAME || 'launchpad_dev',
    user: process.env.DB_USER || null,
    password: process.env.DB_PASSWORD || null,
    connectionString: process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL || null,
    filename: process.env.DB_FILENAME || null, // For SQLite
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) || 10,
    options: {
      // Additional database-specific options
      ssl: process.env.DB_SSL === 'true',
      timeout: parseInt(process.env.DB_TIMEOUT, 10) || 30000
    }
  },

  // Email Configuration (for future use)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || null,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || null,
        pass: process.env.SMTP_PASS || null
      }
    }
  }
}

/**
 * Validates configuration based on environment
 * @throws {Error} If validation fails
 */
const validateConfig = () => {
  // SECURITY: Prevent production mode
  if (config.server.environment === 'production') {
    throw new Error('PRODUCTION MODE DISABLED FOR SECURITY - Only development environment is allowed')
  }

  // Force development environment if anything other than test
  if (config.server.environment !== 'test' && config.server.environment !== 'development') {
    console.warn('Non-development environment detected, forcing development mode for security')
    config.server.environment = 'development'
  }

  // Validate port range
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('PORT must be between 1 and 65535')
  }

  // Ensure localhost-only binding for security
  if (config.server.host !== 'localhost' && config.server.host !== '127.0.0.1' && config.server.host !== '0.0.0.0') {
    console.warn('Non-localhost host detected, forcing localhost for security')
    config.server.host = 'localhost'
  }

  // Validate CORS origin format and ensure localhost only
  if (config.cors.origin && !config.cors.origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)/)) {
    console.warn('Non-localhost CORS origin detected, forcing localhost for security')
    config.cors.origin = 'http://localhost:3000'
  }
}

/**
 * Returns environment-specific configuration
 * @returns {Object} Configuration object
 */
const getConfig = () => {
  validateConfig()
  return config
}

/**
 * Checks if the application is running in development mode
 * @returns {boolean} True if in development mode
 */
const isDevelopment = () => config.server.environment === 'development'

/**
 * Checks if the application is running in production mode
 * @returns {boolean} Always false - production mode disabled for security
 */
const isProduction = () => {
  // SECURITY: Always return false to prevent production mode
  return false
}

/**
 * Checks if the application is running in test mode
 * @returns {boolean} True if in test mode
 */
const isTest = () => config.server.environment === 'test'

module.exports = {
  config: getConfig(),
  isDevelopment,
  isProduction,
  isTest,
  validateRequiredEnvVars
}
