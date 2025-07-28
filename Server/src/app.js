/**
 * @fileoverview Main application entry point
 * @description Express.js application with middleware setup and route configuration
 * @author Template Generator
 * @version 1.0.0
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')

// Import configuration and utilities
const { config, isDevelopment, isProduction } = require('./config')
const { logger } = require('./utils/logger')
const { sendError } = require('./utils/helpers')
const { requestTimer, handleCors } = require('./middleware')

// SECURITY: Prevent production mode startup
if (isProduction() || config.server.environment === 'production') {
  console.error('SECURITY ERROR: Production mode is disabled')
  console.error('Only development environment is allowed for security')
  process.exit(1)
}

// SECURITY: Ensure localhost-only operation
if (config.server.host !== 'localhost' && config.server.host !== '127.0.0.1' && config.server.host !== '0.0.0.0') {
  console.error('SECURITY ERROR: Only localhost binding is allowed')
  process.exit(1)
}

// Initialize Express app
const app = express()

// Trust proxy for proper IP detection when behind reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet(config.security.helmet))

// CORS configuration
app.use(cors(config.cors))

// Handle CORS preflight requests
app.use(handleCors)

// Compression middleware for response optimization
app.use(compression())

// Request timing middleware
app.use(requestTimer)

// HTTP request logging
if (isDevelopment()) {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }))
}

// Body parsing middleware with size limits
app.use(express.json({ limit: config.api.bodyLimit }))
app.use(express.urlencoded({
  extended: true,
  limit: config.api.bodyLimit
}))

// API routes
app.use('/api', require('./routes/api'))

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.environment,
    version: config.api.version,
    security_notice: 'DEVELOPMENT MODE ONLY - Production disabled for security'
  }

  // Include detailed info in development (always enabled now)
  healthData.uptime = process.uptime()
  healthData.memory = process.memoryUsage()
  healthData.pid = process.pid
  healthData.localhost_only = true

  logger.info('Health check requested', { ip: req.ip })
  res.status(200).json(healthData)
})

// Root endpoint with server information
app.get('/', (req, res) => {
  const serverInfo = {
    message: 'Server is running in DEVELOPMENT MODE ONLY!',
    timestamp: new Date().toISOString(),
    environment: config.server.environment,
    version: config.api.version,
    node: process.version,
    uptime: process.uptime(),
    security_notice: 'Production mode disabled for security - localhost only',
    localhost_only: true
  }

  logger.info('Root endpoint accessed', { ip: req.ip })
  res.json(serverInfo)
})

// 404 handler for undefined routes
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  })

  sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    {
      availableEndpoints: [
        'GET /',
        'GET /health',
        'GET /api',
        'GET /api/users',
        'POST /api/users'
      ]
    },
    'ROUTE_NOT_FOUND'
  )
})

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  const statusCode = err.status || err.statusCode || 500

  sendError(
    res,
    isDevelopment() ? err.message : 'Internal Server Error',
    statusCode,
    isDevelopment() ? { stack: err.stack } : null,
    'INTERNAL_ERROR'
  )
})

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)

  // Close server and cleanup resources
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server only if not in test environment
if (!require.main || require.main === module) {
  if (config.server.environment !== 'test') {
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Server running on http://${config.server.host}:${config.server.port}`)
      logger.info(`📊 Environment: ${config.server.environment} (DEVELOPMENT ONLY)`)
      logger.info(`🔒 Security: Production mode disabled, localhost only`)
      logger.info(`🕒 Started at: ${new Date().toISOString()}`)
    })

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.server.port} is already in use`)
      } else {
        logger.logError(error)
      }
      process.exit(1)
    })
  }
}

module.exports = app
