/**
 * @fileoverview Authentication Service
 * @description Business logic for authentication operations
 * @author LaunchPad Template
 * @version 1.0.0
 */

const {
  hashPassword,
  comparePassword,
  generateTokens,
  validatePasswordStrength,
  sanitizeUser
} = require('../utils/auth')
const { AppError } = require('../utils/errors')
const { logger } = require('../utils/logger')
const DatabaseFactory = require('../data/DatabaseFactory')
const UserRepository = require('../data/repositories/UserRepository')
const { config } = require('../config')

/**
 * AuthService class
 * Handles authentication operations
 */
class AuthService {
  constructor () {
    // Initialize database and repository
    const database = DatabaseFactory.create(config.database.type, config.database)
    this.userRepository = new UserRepository(database)

    // ⚠️ SECURITY WARNING: In-memory storage for refresh tokens
    // ❌ NOT PRODUCTION READY - tokens will be lost on server restart
    // ❌ NOT SCALABLE - doesn't work with multiple server instances
    // ❌ NO PERSISTENCE - all users logged out on deployment
    //
    // TODO: Replace with Redis/Memcached for production:
    //   - Persistent storage across restarts
    //   - Shared storage across server instances
    //   - TTL support for automatic cleanup
    //   - Example: redis.setex(`refresh:${userId}`, 604800, token)
    //
    // See SECURITY.md for production deployment requirements
    this.refreshTokens = new Map()
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.username - Username (optional)
   * @param {string} userData.firstName - First name (optional)
   * @param {string} userData.lastName - Last name (optional)
   * @returns {Promise<Object>} Registered user and tokens
   */
  async register (userData) {
    const { email, password, username, firstName, lastName, role } = userData

    // Validate email format
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new AppError('Invalid email format', 400)
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(email)
    if (existingEmail) {
      // ℹ️ SECURITY TRADE-OFF: Specific error message enables account enumeration
      // but provides better user experience. For higher security, use generic message:
      // "Registration failed" (see SECURITY.md section 6)
      throw new AppError('Email already registered', 409)
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await this.userRepository.findByUsername(username)
      if (existingUsername) {
        // ℹ️ SECURITY TRADE-OFF: Same as above - enables enumeration but better UX
        throw new AppError('Username already taken', 409)
      }
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors.join(', '), 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Prevent non-admin users from setting admin role
    const userRole = role === 'admin' ? 'user' : (role || 'user')

    // Create user
    const newUser = await this.userRepository.createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username || email.split('@')[0],
      firstName: firstName || null,
      lastName: lastName || null,
      role: userRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    logger.info(`User registered: ${newUser.id} - ${newUser.email}`)

    // Generate tokens
    const tokens = generateTokens(newUser)

    // Store refresh token
    this.refreshTokens.set(newUser.id, tokens.refreshToken)

    return {
      user: sanitizeUser(newUser),
      ...tokens
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User and tokens
   */
  async login (credentials) {
    const { email, password } = credentials

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase())
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403)
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`)
      throw new AppError('Invalid credentials', 401)
    }

    // Update last login
    await this.userRepository.updateById(user.id, {
      lastLoginAt: new Date(),
      updatedAt: new Date()
    })

    logger.info(`User logged in: ${user.id} - ${user.email}`)

    // Generate tokens
    const tokens = generateTokens(user)

    // Store refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken)

    return {
      user: sanitizeUser(user),
      ...tokens
    }
  }

  /**
   * Refresh access token
   * @param {number|string} userId - User ID from verified refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken (userId, refreshToken) {
    // Verify refresh token is stored
    const storedToken = this.refreshTokens.get(parseInt(userId, 10))
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401)
    }

    // Get user
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403)
    }

    logger.info(`Access token refreshed for user: ${user.id}`)

    // Generate new tokens
    const tokens = generateTokens(user)

    // Update stored refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken)

    return {
      ...tokens
    }
  }

  /**
   * Logout user
   * @param {number|string} userId - User ID
   * @returns {Promise<void>}
   */
  async logout (userId) {
    // Remove refresh token
    this.refreshTokens.delete(parseInt(userId, 10))
    logger.info(`User logged out: ${userId}`)
  }

  /**
   * Change password
   * @param {number|string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword (userId, currentPassword, newPassword) {
    // Get user
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401)
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors.join(', '), 400)
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await this.userRepository.updateById(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    })

    // Invalidate all refresh tokens for this user
    // ⚠️ SECURITY NOTE: This only invalidates refresh tokens
    // Existing access tokens remain valid until expiration (15 minutes)
    // For immediate invalidation, implement token blacklist (requires Redis)
    // See SECURITY.md section 3 for details
    this.refreshTokens.delete(parseInt(userId, 10))

    logger.info(`Password changed for user: ${userId}`)
  }

  /**
   * Verify user email (placeholder for future implementation)
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verified user
   */
  async verifyEmail (token) {
    // TODO: Implement email verification logic
    throw new AppError('Email verification not implemented yet', 501)
  }

  /**
   * Request password reset (placeholder for future implementation)
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async requestPasswordReset (email) {
    // TODO: Implement password reset request logic
    throw new AppError('Password reset not implemented yet', 501)
  }

  /**
   * Reset password (placeholder for future implementation)
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword (token, newPassword) {
    // TODO: Implement password reset logic
    throw new AppError('Password reset not implemented yet', 501)
  }
}

module.exports = AuthService
