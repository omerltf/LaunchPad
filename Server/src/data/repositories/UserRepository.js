/**
 * @fileoverview User Repository
 * @description Repository for user data access operations
 * @author LaunchPad Template
 * @version 1.0.0
 */

const BaseRepository = require('./BaseRepository')

/**
 * User Repository class
 * Handles user-specific data operations
 */
class UserRepository extends BaseRepository {
  constructor (database) {
    super(database, 'users')
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail (email) {
    return this.findOne({ email })
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User or null
   */
  async findByUsername (username) {
    return this.findOne({ username })
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async emailExists (email) {
    return this.exists({ email })
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if exists
   */
  async usernameExists (username) {
    return this.exists({ username })
  }

  /**
   * Create user with validation
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser (userData) {
    // Add any user-specific validation here
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return this.create(user)
  }

  /**
   * Update user profile
   * @param {string|number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object|null>} Updated user
   */
  async updateProfile (userId, profileData) {
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    }

    return this.updateById(userId, updateData)
  }

  /**
   * Find active users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active users
   */
  async findActive (options = {}) {
    return this.find({ isActive: true }, options)
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users with specified role
   */
  async findByRole (role, options = {}) {
    return this.find({ role }, options)
  }

  /**
   * Deactivate user
   * @param {string|number} userId - User ID
   * @returns {Promise<Object|null>} Updated user
   */
  async deactivate (userId) {
    return this.updateById(userId, {
      isActive: false,
      deactivatedAt: new Date(),
      updatedAt: new Date()
    })
  }

  /**
   * Activate user
   * @param {string|number} userId - User ID
   * @returns {Promise<Object|null>} Updated user
   */
  async activate (userId) {
    return this.updateById(userId, {
      isActive: true,
      activatedAt: new Date(),
      updatedAt: new Date()
    })
  }
}

module.exports = UserRepository
