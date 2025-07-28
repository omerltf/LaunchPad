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
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:']
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

  // Database Configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || null,
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) || 20
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
  // Validate port range
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('PORT must be between 1 and 65535')
  }

  // Validate JWT secret in production
  if (config.server.environment === 'production' &&
      config.security.jwtSecret === 'fallback-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment')
  }

  // Validate CORS origin format
  if (config.cors.origin && !config.cors.origin.match(/^https?:\/\/.+/)) {
    // eslint-disable-next-line no-console
    console.warn('CORS_ORIGIN should be a valid URL format (http:// or https://)')
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
 * @returns {boolean} True if in production mode
 */
const isProduction = () => config.server.environment === 'production'

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
