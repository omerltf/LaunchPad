/**
 * @fileoverview Custom error classes
 * @description Defines custom error types for better error handling
 * @author LaunchPad Template
 * @version 1.0.0
 */

/**
 * Base application error class
 * Extends the native Error class with HTTP status code and additional context
 */
class AppError extends Error {
  constructor (message, statusCode = 500, context = {}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.context = context
    this.isOperational = true // Distinguishes operational errors from programming errors

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert error to JSON format
   * @returns {Object} Error object in JSON format
   */
  toJSON () {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context
    }
  }
}

/**
 * Validation error (400)
 */
class ValidationError extends AppError {
  constructor (message, errors = []) {
    super(message, 400, { errors })
    this.errors = errors
  }
}

/**
 * Authentication error (401)
 */
class AuthenticationError extends AppError {
  constructor (message = 'Authentication required') {
    super(message, 401)
  }
}

/**
 * Authorization error (403)
 */
class AuthorizationError extends AppError {
  constructor (message = 'Insufficient permissions') {
    super(message, 403)
  }
}

/**
 * Not found error (404)
 */
class NotFoundError extends AppError {
  constructor (resource = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

/**
 * Conflict error (409)
 */
class ConflictError extends AppError {
  constructor (message = 'Resource already exists') {
    super(message, 409)
  }
}

/**
 * Rate limit error (429)
 */
class RateLimitError extends AppError {
  constructor (message = 'Too many requests') {
    super(message, 429)
  }
}

/**
 * Internal server error (500)
 */
class InternalError extends AppError {
  constructor (message = 'Internal server error') {
    super(message, 500)
  }
}

/**
 * Database error (500)
 */
class DatabaseError extends AppError {
  constructor (message = 'Database operation failed', originalError = null) {
    super(message, 500, { originalError: originalError?.message })
    this.originalError = originalError
  }
}

/**
 * External service error (503)
 */
class ServiceError extends AppError {
  constructor (service, message = 'External service unavailable') {
    super(message, 503, { service })
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  DatabaseError,
  ServiceError
}
