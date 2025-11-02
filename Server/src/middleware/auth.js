/**
 * @fileoverview Authentication middleware
 * @description JWT authentication and authorization middleware
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { verifyToken, extractToken, TOKEN_TYPES } = require('../utils/auth')
const { AppError } = require('../utils/errors')
const { asyncHandler } = require('../utils/helpers')
const { logger } = require('../utils/logger')

/**
 * Middleware to authenticate requests using JWT
 * Verifies the JWT token and attaches user information to req.user
 *
 * Security Notes:
 * - Expects "Bearer <token>" format in Authorization header
 * - Only accepts ACCESS tokens (not refresh tokens)
 * - Token expiry is 15 minutes (configurable in config)
 * - Generic error messages prevent information disclosure
 * - Failed attempts are logged for security monitoring
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization
  const token = extractToken(authHeader)

  if (!token) {
    throw new AppError('Authentication token required', 401)
  }

  // Verify token (throws if expired, invalid, or wrong type)
  // ℹ️ This validates: signature, expiry, token type (access vs refresh)
  const decoded = verifyToken(token, TOKEN_TYPES.ACCESS)

  // Attach user information to request
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role
  }

  logger.debug(`User authenticated: ${decoded.userId}`)
  next()
})

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 * @param {...string} roles - Required roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed for user ${req.user.userId}. Required roles: ${roles.join(', ')}, User role: ${req.user.role}`)
      throw new AppError('Insufficient permissions', 403)
    }

    logger.debug(`User ${req.user.userId} authorized with role: ${req.user.role}`)
    next()
  })
}

/**
 * Middleware to optionally authenticate requests
 * Doesn't throw error if token is missing, but verifies if present
 * Useful for endpoints that work differently for authenticated vs. unauthenticated users
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = extractToken(authHeader)

    if (token) {
      const decoded = verifyToken(token, TOKEN_TYPES.ACCESS)
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
      logger.debug(`User optionally authenticated: ${decoded.userId}`)
    }
  } catch (error) {
    // Log but don't throw error for optional authentication
    logger.debug('Optional authentication failed, continuing as unauthenticated user')
  }

  next()
})

/**
 * Middleware to verify refresh token
 * Used for token refresh endpoint
 */
const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401)
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH)

  // Attach user ID to request
  req.userId = decoded.userId

  logger.debug(`Refresh token verified for user: ${decoded.userId}`)
  next()
})

/**
 * Middleware to check if user owns the resource
 * Compares req.user.userId with req.params.id or req.params.userId
 * Must be used after authenticate middleware
 * @param {string} paramName - Name of the parameter to check (default: 'id')
 */
const checkOwnership = (paramName = 'id') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    const resourceUserId = req.params[paramName]

    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next()
    }

    // Check if user owns the resource
    if (req.user.userId !== parseInt(resourceUserId, 10) && req.user.userId !== resourceUserId) {
      logger.warn(`Ownership check failed for user ${req.user.userId} accessing resource ${resourceUserId}`)
      throw new AppError('You do not have permission to access this resource', 403)
    }

    logger.debug(`Ownership verified for user ${req.user.userId} accessing resource ${resourceUserId}`)
    next()
  })
}

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate,
  verifyRefreshToken,
  checkOwnership
}
