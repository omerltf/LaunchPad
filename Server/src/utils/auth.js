/**
 * @fileoverview Authentication utilities
 * @description JWT token generation/verification and password hashing functions
 * @author LaunchPad Template
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { config } = require('../config')
const { logger } = require('./logger')
const { AppError } = require('./errors')

/**
 * Password hashing configuration
 * Use 1 round for test environment to speed up tests (bcrypt is intentionally slow)
 */
const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10

/**
 * Token types
 */
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh'
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    logger.error('Error hashing password', error)
    throw new AppError('Failed to hash password', 500)
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    logger.error('Error comparing password', error)
    throw new AppError('Failed to verify password', 500)
  }
}

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  try {
    if (!config.security.jwtSecret) {
      throw new Error('JWT_SECRET is not configured')
    }

    return jwt.sign(
      {
        ...payload,
        type: TOKEN_TYPES.ACCESS
      },
      config.security.jwtSecret,
      {
        expiresIn: config.security.jwtExpiresIn || '15m'
      }
    )
  } catch (error) {
    logger.error('Error generating access token', error)
    throw new AppError('Failed to generate access token', 500)
  }
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    if (!config.security.jwtSecret) {
      throw new Error('JWT_SECRET is not configured')
    }

    return jwt.sign(
      {
        userId: payload.userId,
        type: TOKEN_TYPES.REFRESH
      },
      config.security.jwtSecret,
      {
        expiresIn: config.security.jwtRefreshExpiresIn || '7d'
      }
    )
  } catch (error) {
    logger.error('Error generating refresh token', error)
    throw new AppError('Failed to generate refresh token', 500)
  }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object with access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user'
  }

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ userId: user.id })
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} expectedType - Expected token type (access or refresh)
 * @returns {Object} Decoded token payload
 * @throws {AppError} If token is invalid or expired
 */
const verifyToken = (token, expectedType = TOKEN_TYPES.ACCESS) => {
  try {
    if (!config.security.jwtSecret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, config.security.jwtSecret)

    // Verify token type matches expected type
    if (decoded.type !== expectedType) {
      throw new AppError('Invalid token type', 401)
    }

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired', 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401)
    }
    if (error instanceof AppError) {
      throw error
    }

    logger.error('Error verifying token', error)
    throw new AppError('Failed to verify token', 500)
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
const extractToken = (authHeader) => {
  if (!authHeader) {
    return null
  }

  // Check for Bearer token
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
    return parts[1]
  }

  return null
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors array
 */
const validatePasswordStrength = (password) => {
  const errors = []
  const minLength = 8
  const maxLength = 128

  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors }
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }

  if (password.length > maxLength) {
    errors.push(`Password must not exceed ${maxLength} characters`)
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize user object for API response (remove sensitive data)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
  if (!user) {
    return null
  }

  const sanitized = { ...user }
  delete sanitized.password
  delete sanitized.passwordHash
  delete sanitized.refreshToken
  delete sanitized.resetPasswordToken
  delete sanitized.resetPasswordExpires

  return sanitized
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  extractToken,
  validatePasswordStrength,
  sanitizeUser,
  TOKEN_TYPES
}
