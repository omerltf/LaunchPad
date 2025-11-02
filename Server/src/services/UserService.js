/**
 * @fileoverview User Service
 * @description Business logic for user management operations
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { sanitizeUser } = require('../utils/auth')
const { AppError } = require('../utils/errors')
const { logger } = require('../utils/logger')
const DatabaseFactory = require('../data/DatabaseFactory')
const UserRepository = require('../data/repositories/UserRepository')
const { config } = require('../config')

/**
 * UserService class
 * Handles user management operations
 */
class UserService {
  constructor () {
    // Initialize database and repository
    const database = DatabaseFactory.create(config.database.type, config.database)
    this.userRepository = new UserRepository(database)
  }

  /**
   * Get user by ID
   * @param {number|string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById (userId) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return sanitizeUser(user)
  }

  /**
   * Get user profile (alias for getUserById)
   * @param {number|string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile (userId) {
    return this.getUserById(userId)
  }

  /**
   * Update user profile
   * @param {number|string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile (userId, updateData) {
    // Validate user exists
    const existingUser = await this.userRepository.findById(userId)
    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Prevent updating sensitive fields
    const allowedFields = ['firstName', 'lastName', 'username']
    const filteredData = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    // Check if username is being updated and is unique
    if (filteredData.username && filteredData.username !== existingUser.username) {
      const existingUsername = await this.userRepository.findByUsername(filteredData.username)
      if (existingUsername) {
        throw new AppError('Username already taken', 409)
      }
    }

    // Update user
    const updatedUser = await this.userRepository.updateProfile(userId, filteredData)

    if (!updatedUser) {
      throw new AppError('Failed to update profile', 500)
    }

    logger.info(`User profile updated: ${userId}`)

    return sanitizeUser(updatedUser)
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Query options (page, limit, role, isActive)
   * @returns {Promise<Object>} Users list with pagination
   */
  async getAllUsers (options = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      isActive
    } = options

    // Build query filters
    const filters = {}
    if (role) filters.role = role
    if (isActive !== undefined) filters.isActive = isActive

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await this.userRepository.find(filters, {
      limit: parseInt(limit, 10),
      skip
    })

    // Get total count for pagination
    const total = await this.userRepository.count(filters)

    // Sanitize all users
    const sanitizedUsers = users.map(user => sanitizeUser(user))

    return {
      users: sanitizedUsers,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Deactivate user (admin only or self)
   * @param {number|string} userId - User ID
   * @param {number|string} requesterId - ID of user making the request
   * @param {string} requesterRole - Role of user making the request
   * @returns {Promise<Object>} Deactivated user
   */
  async deactivateUser (userId, requesterId, requesterRole) {
    // Check permissions
    const userIdInt = parseInt(userId, 10)
    const requesterIdInt = parseInt(requesterId, 10)

    if (requesterRole !== 'admin' && userIdInt !== requesterIdInt) {
      throw new AppError('Insufficient permissions', 403)
    }

    // Prevent self-deactivation for admins
    if (requesterRole === 'admin' && userIdInt === requesterIdInt) {
      throw new AppError('Admins cannot deactivate their own account', 400)
    }

    // Deactivate user
    const deactivatedUser = await this.userRepository.deactivate(userId)

    if (!deactivatedUser) {
      throw new AppError('User not found', 404)
    }

    logger.info(`User deactivated: ${userId} by ${requesterId}`)

    return sanitizeUser(deactivatedUser)
  }

  /**
   * Activate user (admin only)
   * @param {number|string} userId - User ID
   * @returns {Promise<Object>} Activated user
   */
  async activateUser (userId) {
    const activatedUser = await this.userRepository.activate(userId)

    if (!activatedUser) {
      throw new AppError('User not found', 404)
    }

    logger.info(`User activated: ${userId}`)

    return sanitizeUser(activatedUser)
  }

  /**
   * Update user role (admin only)
   * @param {number|string} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateUserRole (userId, newRole) {
    const validRoles = ['user', 'moderator', 'admin']

    if (!validRoles.includes(newRole)) {
      throw new AppError('Invalid role specified', 400)
    }

    const updatedUser = await this.userRepository.updateById(userId, {
      role: newRole,
      updatedAt: new Date()
    })

    if (!updatedUser) {
      throw new AppError('User not found', 404)
    }

    logger.info(`User role updated: ${userId} to ${newRole}`)

    return sanitizeUser(updatedUser)
  }

  /**
   * Delete user (admin only)
   * @param {number|string} userId - User ID
   * @param {number|string} requesterId - ID of user making the request
   * @returns {Promise<void>}
   */
  async deleteUser (userId, requesterId) {
    const userIdInt = parseInt(userId, 10)
    const requesterIdInt = parseInt(requesterId, 10)

    // Prevent self-deletion
    if (userIdInt === requesterIdInt) {
      throw new AppError('Cannot delete your own account', 400)
    }

    const deleted = await this.userRepository.deleteById(userId)

    if (!deleted) {
      throw new AppError('User not found', 404)
    }

    logger.info(`User deleted: ${userId} by ${requesterId}`)
  }

  /**
   * Search users by email or username
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Matching users
   */
  async searchUsers (query, options = {}) {
    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400)
    }

    // ⚠️ PERFORMANCE & SECURITY WARNING: This loads ALL users into memory
    // ❌ NOT PRODUCTION READY for large user bases
    // ❌ POTENTIAL DOS VECTOR: Can cause memory exhaustion with many users
    // ❌ NO PAGINATION: Returns all matching results
    //
    // TODO: Replace with database-level search for production:
    //   - Use database LIKE/ILIKE queries with proper indexing
    //   - Add pagination (limit/offset)
    //   - Consider full-text search (PostgreSQL, ElasticSearch)
    //   - Example: this.userRepository.search(query, { limit, offset })
    //
    // See SECURITY.md section 8 for recommendations

    // Hard limit: throw error if user count > 1000 to prevent memory exhaustion
    const totalUsers = await this.userRepository.count({})
    if (totalUsers > 1000) {
      throw new AppError('Too many users to search in memory. Please contact support.', 503)
    }

    const allUsers = await this.userRepository.find({})

    const matchingUsers = allUsers.filter(user =>
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(query.toLowerCase())
    )

    return matchingUsers.map(user => sanitizeUser(user))
  }
}

module.exports = UserService
