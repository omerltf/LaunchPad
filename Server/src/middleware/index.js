/**
 * @fileoverview Custom middleware functions for the application
 * @description Authentication, rate limiting, validation and other middleware
 * @author Template Generator
 * @version 1.0.0
 */

const { config } = require('../config')
const { sendError } = require('../utils/helpers')

/**
 * Authentication middleware (JWT token verification placeholder)
 * @description Validates JWT tokens from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return sendError(res, 'Access token is required', 401, null, 'MISSING_TOKEN')
  }

  // TODO: Implement proper JWT verification
  // Example implementation:
  // try {
  //   const decoded = jwt.verify(token, config.security.jwtSecret)
  //   req.user = decoded
  //   next()
  // } catch (error) {
  //   return sendError(res, 'Invalid or expired token', 403, null, 'INVALID_TOKEN')
  // }

  // Placeholder - always pass for now
  req.user = { id: 'placeholder', role: 'user' }
  next()
}

/**
 * Rate limiting middleware with configurable windows and limits
 * @description Implements basic rate limiting using in-memory storage
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @returns {Function} Middleware function
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = config.rateLimit.windowMs,
    max = config.rateLimit.maxRequests
  } = options

  const requests = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean old entries to prevent memory leaks
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key)
      }
    }

    // Count current requests from this IP
    const userRequests = Array.from(requests.entries())
      .filter(([key]) => key.startsWith(ip))
      .length

    if (userRequests >= max) {
      return sendError(
        res,
        'Too many requests, please try again later',
        429,
        {
          retryAfter: Math.ceil(windowMs / 1000),
          limit: max,
          window: windowMs
        },
        'RATE_LIMIT_EXCEEDED'
      )
    }

    // Store this request
    requests.set(`${ip}-${now}`, now)

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - userRequests - 1),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    })

    next()
  }
}

/**
 * Advanced input validation middleware with custom validation rules
 * @description Validates request data against a schema with detailed error reporting
 * @param {Object} schema - Validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Middleware function
 *
 * Schema format:
 * {
 *   fieldName: {
 *     required: boolean,
 *     type: 'string' | 'number' | 'email' | 'url' | 'boolean',
 *     minLength: number,
 *     maxLength: number,
 *     min: number,
 *     max: number,
 *     pattern: RegExp,
 *     custom: function(value) { return { isValid: boolean, message: string } }
 *   }
 * }
 *
 * Example usage:
 * const userSchema = {
 *   name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
 *   email: { required: true, type: 'email' }
 * }
 * router.post('/users', validateInput(userSchema), (req, res) => { ... })
 */
const validateInput = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source]
    const errors = []

    if (!data) {
      return sendError(res, `Request ${source} is required`, 400, null, 'MISSING_DATA')
    }

    // Validate each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      // Check if required field is missing
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`)
        continue
      }

      // Skip validation if field is not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue
      }

      // Type validation
      if (rules.type && value !== undefined && value !== null) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${field} must be a string`)
            }
            break
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`${field} must be a number`)
            }
            break
          case 'email':
            if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(`${field} must be a valid email address`)
            }
            break
          case 'url':
            try {
              new URL(value) // eslint-disable-line no-new
            } catch {
              errors.push(`${field} must be a valid URL`)
            }
            break
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${field} must be a boolean`)
            }
            break
        }
      }

      // String length validation
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`)
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`)
        }
      }

      // Number range validation
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value)
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`)
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }

      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customResult = rules.custom(value)
        if (customResult && !customResult.isValid) {
          errors.push(customResult.message || `${field} is invalid`)
        }
      }
    }

    if (errors.length > 0) {
      return sendError(
        res,
        'Validation failed',
        400,
        errors,
        'VALIDATION_ERROR'
      )
    }

    next()
  }
}

/**
 * Request timing middleware
 * @description Adds request timing information to response headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestTimer = (req, res, next) => {
  const startTime = Date.now()

  // Override the res.end method to add timing before sending response
  const originalEnd = res.end
  res.end = function (...args) {
    const duration = Date.now() - startTime
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`)
    }
    originalEnd.apply(this, args)
  }

  next()
}

/**
 * CORS preflight handler
 * @description Handles CORS preflight requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleCors = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Origin': config.cors.origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    })
    return res.status(204).end()
  }
  next()
}

module.exports = {
  authenticateToken,
  rateLimit,
  validateInput,
  requestTimer,
  handleCors
}
