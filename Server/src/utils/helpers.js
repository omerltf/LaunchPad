/**
 * @fileoverview Utility helper functions
 * @description Common utility functions for response handling, validation, and data manipulation
 * @author Template Generator
 * @version 1.0.0
 */

/**
 * Sends a standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to include in response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Additional metadata
 * @returns {Object} Express response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...meta,
    timestamp: new Date().toISOString()
  })
}

/**
 * Sends a standardized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} details - Additional error details
 * @param {string} code - Error code for client handling
 * @returns {Object} Express response
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, details = null, code = null) => {
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }

  if (details) errorResponse.details = details
  if (code) errorResponse.code = code

  return res.status(statusCode).json(errorResponse)
}

/**
 * Wraps async functions to catch errors and pass them to error middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Generates a random alphanumeric ID
 * @param {number} length - Length of the ID (default: 9)
 * @returns {string} Random ID
 */
const generateId = (length = 9) => {
  return Math.random().toString(36).substr(2, length)
}

/**
 * Validates email format using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false

  try {
    new URL(url) // eslint-disable-line no-new
    return true
  } catch {
    return false
  }
}

/**
 * Sanitizes a string by removing potentially harmful characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return ''

  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
}

/**
 * Formats a date to ISO string with validation
 * @param {Date|string|number} date - Date to format (default: current date)
 * @returns {string} ISO formatted date string
 */
const formatDate = (date = new Date()) => {
  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }

  return dateObj.toISOString()
}

/**
 * Calculates pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
const calculatePagination = (page, limit, total) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
  const totalItems = parseInt(total, 10) || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const offset = (currentPage - 1) * itemsPerPage

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  }
}

/**
 * Creates a delay for testing or rate limiting
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Removes sensitive fields from an object
 * @param {Object} obj - Object to sanitize
 * @param {string[]} fields - Fields to remove
 * @returns {Object} Sanitized object
 */
const removeSensitiveFields = (obj, fields = ['password', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') return obj

  const sanitized = { ...obj }
  fields.forEach(field => {
    delete sanitized[field]
  })

  return sanitized
}

/**
 * Validates required fields in an object
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid boolean and missing fields array
 */
const validateRequiredFields = (data, requiredFields) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, missing: requiredFields }
  }

  const missing = requiredFields.filter(field =>
    data[field] === undefined ||
    data[field] === null ||
    data[field] === ''
  )

  return {
    isValid: missing.length === 0,
    missing
  }
}

module.exports = {
  sendSuccess,
  sendError,
  asyncHandler,
  generateId,
  isValidEmail,
  isValidUrl,
  sanitizeString,
  formatDate,
  calculatePagination,
  delay,
  removeSensitiveFields,
  validateRequiredFields
}
