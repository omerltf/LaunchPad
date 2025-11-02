/**
 * @fileoverview Maintenance Mode Manager
 * @description Manages maintenance mode state with persistence and database-ready interface
 * @author LaunchPad
 * @version 1.0.0
 */

const fs = require('fs').promises
const path = require('path')
const { logger } = require('./logger')

/**
 * MaintenanceManager class
 * Handles maintenance mode state with pluggable storage backends
 */
class MaintenanceManager {
  /**
   * @param {string} storageType - Storage type: 'file', 'database', 'memory'
   * @param {object} options - Configuration options
   */
  constructor (storageType = 'file', options = {}) {
    this.storageType = storageType
    this.filePath = options.filePath || path.join(__dirname, '../../data/maintenance-state.json')
    this.dbConnection = options.dbConnection || null

    // In-memory cache for performance
    this.cache = {
      enabled: false,
      message: 'We are currently performing scheduled maintenance. Please check back soon.',
      lastModified: new Date().toISOString(),
      modifiedBy: 'system',
      history: []
    }

    this.initialized = false
  }

  /**
   * Initialize the maintenance manager
   * Loads existing state or creates default
   */
  async initialize () {
    if (this.initialized) {
      return
    }

    try {
      switch (this.storageType) {
        case 'file':
          await this._initializeFileStorage()
          break
        case 'database':
          await this._initializeDatabaseStorage()
          break
        case 'memory':
          logger.info('MaintenanceManager initialized with in-memory storage')
          break
        default:
          throw new Error(`Unknown storage type: ${this.storageType}`)
      }

      this.initialized = true
      logger.info(`MaintenanceManager initialized with ${this.storageType} storage`, {
        enabled: this.cache.enabled,
        lastModified: this.cache.lastModified
      })
    } catch (error) {
      logger.error('Failed to initialize MaintenanceManager', error)
      // Fallback to memory storage
      this.storageType = 'memory'
      this.initialized = true
      logger.warn('Falling back to in-memory storage')
    }
  }

  /**
   * Initialize file-based storage
   * @private
   */
  async _initializeFileStorage () {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath)
      await fs.mkdir(dir, { recursive: true })

      // Try to load existing state
      try {
        const data = await fs.readFile(this.filePath, 'utf8')
        const state = JSON.parse(data)
        this.cache = { ...this.cache, ...state }
        logger.info('Loaded maintenance state from file', { path: this.filePath })
      } catch (readError) {
        // File doesn't exist, create default
        if (readError.code === 'ENOENT') {
          await this._saveToFile()
          logger.info('Created new maintenance state file', { path: this.filePath })
        } else {
          throw readError
        }
      }
    } catch (error) {
      logger.error('Error initializing file storage', error)
      throw error
    }
  }

  /**
   * Initialize database storage (placeholder for future implementation)
   * @private
   */
  async _initializeDatabaseStorage () {
    if (!this.dbConnection) {
      throw new Error('Database connection required for database storage')
    }

    // TODO: Implement database initialization when database is available
    // Example:
    // const state = await this.dbConnection.query('SELECT * FROM maintenance_mode LIMIT 1')
    // if (state) {
    //   this.cache = state
    // } else {
    //   await this._saveToDatabase()
    // }

    logger.info('Database storage initialized (placeholder)')
  }

  /**
   * Save state to file
   * @private
   */
  async _saveToFile () {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(this.cache, null, 2),
        'utf8'
      )
      logger.debug('Saved maintenance state to file')
    } catch (error) {
      logger.error('Error saving to file', error)
      throw error
    }
  }

  /**
   * Save state to database (placeholder)
   * @private
   */
  async _saveToDatabase () {
    if (!this.dbConnection) {
      throw new Error('Database connection not available')
    }

    // TODO: Implement database save when database is available
    // Example:
    // await this.dbConnection.query(
    //   'UPDATE maintenance_mode SET enabled = ?, message = ?, last_modified = ?',
    //   [this.cache.enabled, this.cache.message, this.cache.lastModified]
    // )

    logger.debug('Saved maintenance state to database (placeholder)')
  }

  /**
   * Persist current state based on storage type
   * @private
   */
  async _persist () {
    switch (this.storageType) {
      case 'file':
        await this._saveToFile()
        break
      case 'database':
        await this._saveToDatabase()
        break
      case 'memory':
        // No persistence needed
        break
    }
  }

  /**
   * Get current maintenance mode status
   * @returns {Promise<object>} Current maintenance state
   */
  async getStatus () {
    if (!this.initialized) {
      await this.initialize()
    }

    return {
      enabled: this.cache.enabled,
      message: this.cache.message,
      lastModified: this.cache.lastModified,
      modifiedBy: this.cache.modifiedBy,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Check if maintenance mode is currently enabled
   * @returns {Promise<boolean>}
   */
  async isEnabled () {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.cache.enabled
  }

  /**
   * Set maintenance mode status
   * @param {boolean} enabled - Enable or disable maintenance mode
   * @param {string} message - Optional custom message
   * @param {string} modifiedBy - Who made the change
   * @returns {Promise<object>} Updated state
   */
  async setStatus (enabled, message = null, modifiedBy = 'system') {
    if (!this.initialized) {
      await this.initialize()
    }

    const previousState = { ...this.cache }

    // Update state
    this.cache.enabled = enabled
    if (message) {
      this.cache.message = message
    }
    this.cache.lastModified = new Date().toISOString()
    this.cache.modifiedBy = modifiedBy

    // Add to history
    this.cache.history = this.cache.history || []
    this.cache.history.push({
      enabled,
      message: this.cache.message,
      timestamp: this.cache.lastModified,
      modifiedBy,
      previousState: {
        enabled: previousState.enabled,
        message: previousState.message
      }
    })

    // Keep only last 50 history entries
    if (this.cache.history.length > 50) {
      this.cache.history = this.cache.history.slice(-50)
    }

    // Persist changes
    try {
      await this._persist()

      logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, {
        message: this.cache.message,
        modifiedBy
      })

      return await this.getStatus()
    } catch (error) {
      // Rollback on error
      this.cache = previousState
      logger.error('Failed to persist maintenance state, rolled back', error)
      throw error
    }
  }

  /**
   * Toggle maintenance mode
   * @param {string} message - Optional custom message
   * @param {string} modifiedBy - Who made the change
   * @returns {Promise<object>} Updated state
   */
  async toggle (message = null, modifiedBy = 'system') {
    if (!this.initialized) {
      await this.initialize()
    }

    const newState = !this.cache.enabled
    return await this.setStatus(newState, message, modifiedBy)
  }

  /**
   * Update maintenance message without changing enabled state
   * @param {string} message - New message
   * @param {string} modifiedBy - Who made the change
   * @returns {Promise<object>} Updated state
   */
  async updateMessage (message, modifiedBy = 'system') {
    if (!this.initialized) {
      await this.initialize()
    }

    this.cache.message = message
    this.cache.lastModified = new Date().toISOString()
    this.cache.modifiedBy = modifiedBy

    await this._persist()

    logger.info('Maintenance message updated', { message, modifiedBy })

    return await this.getStatus()
  }

  /**
   * Get maintenance mode history
   * @param {number} limit - Number of history entries to return
   * @returns {Promise<array>} History entries
   */
  async getHistory (limit = 10) {
    if (!this.initialized) {
      await this.initialize()
    }

    const history = this.cache.history || []
    return history.slice(-limit).reverse()
  }

  /**
   * Clear history (useful for cleanup)
   * @returns {Promise<void>}
   */
  async clearHistory () {
    if (!this.initialized) {
      await this.initialize()
    }

    this.cache.history = []
    await this._persist()
    logger.info('Maintenance history cleared')
  }

  /**
   * Switch storage backend (for future database migration)
   * @param {string} newStorageType - New storage type
   * @param {object} options - Configuration options
   */
  async switchStorage (newStorageType, options = {}) {
    logger.info(`Switching storage from ${this.storageType} to ${newStorageType}`)

    // Save current state
    const currentState = { ...this.cache }

    // Update storage configuration
    this.storageType = newStorageType
    if (options.filePath) this.filePath = options.filePath
    if (options.dbConnection) this.dbConnection = options.dbConnection

    // Reinitialize with new storage
    this.initialized = false
    await this.initialize()

    // Restore state to new storage
    this.cache = currentState
    await this._persist()

    logger.info(`Storage switched to ${newStorageType}`)
  }
}

module.exports = MaintenanceManager
