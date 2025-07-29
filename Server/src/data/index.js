/**
 * @fileoverview Data Access Layer Entry Point
 * @description Main entry point for the data access layer with database factory and connection management
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { logger } = require('../utils/logger')
const DatabaseFactory = require('./DatabaseFactory')
const { config } = require('../config')

/**
 * Data Access Layer class
 * Manages database connections and provides unified interface
 */
class DataAccessLayer {
  constructor () {
    this.database = null
    this.isConnected = false
  }

  /**
   * Initialize the data access layer
   * @param {Object} dbConfig - Database configuration
   * @returns {Promise<void>}
   */
  async initialize (dbConfig = config.database) {
    try {
      logger.info('Initializing Data Access Layer...')

      // Create database instance using factory pattern
      this.database = DatabaseFactory.create(dbConfig.type, dbConfig)

      // Connect to database
      await this.database.connect()
      this.isConnected = true

      logger.info(`Connected to ${dbConfig.type} database successfully`)
    } catch (error) {
      logger.error('Failed to initialize Data Access Layer:', error)
      throw error
    }
  }

  /**
   * Get database instance
   * @returns {Object} Database adapter instance
   */
  getDatabase () {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call initialize() first.')
    }
    return this.database
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close () {
    if (this.database && this.isConnected) {
      await this.database.disconnect()
      this.isConnected = false
      logger.info('Database connection closed')
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isReady () {
    return this.isConnected && this.database
  }

  /**
   * Execute database health check
   * @returns {Promise<boolean>}
   */
  async healthCheck () {
    if (!this.isReady()) {
      return false
    }

    try {
      return await this.database.healthCheck()
    } catch (error) {
      logger.error('Database health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
const dataAccessLayer = new DataAccessLayer()

module.exports = {
  DataAccessLayer,
  dataAccessLayer,
  DatabaseFactory
}
