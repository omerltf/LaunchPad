/**
 * @fileoverview Database Factory
 * @description Factory pattern implementation for creating database adapters
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { logger } = require('../utils/logger')

// Import database adapters
const MongoDBAdapter = require('./adapters/MongoDBAdapter')
const MySQLAdapter = require('./adapters/MySQLAdapter')
const PostgreSQLAdapter = require('./adapters/PostgreSQLAdapter')
const SQLiteAdapter = require('./adapters/SQLiteAdapter')
const MemoryAdapter = require('./adapters/MemoryAdapter')

/**
 * Database types enum
 */
const DATABASE_TYPES = {
  MONGODB: 'mongodb',
  MYSQL: 'mysql',
  POSTGRESQL: 'postgresql',
  SQLITE: 'sqlite',
  MEMORY: 'memory'
}

/**
 * Database Factory class
 * Creates appropriate database adapter based on configuration
 */
class DatabaseFactory {
  /**
   * Create database adapter instance
   * @param {string} type - Database type
   * @param {Object} config - Database configuration
   * @returns {Object} Database adapter instance
   */
  static create (type, config) {
    logger.info(`Creating database adapter for type: ${type}`)

    switch (type.toLowerCase()) {
      case DATABASE_TYPES.MONGODB:
        return new MongoDBAdapter(config)

      case DATABASE_TYPES.MYSQL:
        return new MySQLAdapter(config)

      case DATABASE_TYPES.POSTGRESQL:
        return new PostgreSQLAdapter(config)

      case DATABASE_TYPES.SQLITE:
        return new SQLiteAdapter(config)

      case DATABASE_TYPES.MEMORY:
        return new MemoryAdapter(config)

      default:
        throw new Error(`Unsupported database type: ${type}. Supported types: ${Object.values(DATABASE_TYPES).join(', ')}`)
    }
  }

  /**
   * Get list of supported database types
   * @returns {string[]} Array of supported database types
   */
  static getSupportedTypes () {
    return Object.values(DATABASE_TYPES)
  }

  /**
   * Validate database configuration
   * @param {string} type - Database type
   * @param {Object} config - Database configuration
   * @returns {boolean} True if configuration is valid
   */
  static validateConfig (type, config) {
    if (!type || !config) {
      return false
    }

    if (!this.getSupportedTypes().includes(type.toLowerCase())) {
      return false
    }

    // Basic validation - each adapter will perform more specific validation
    switch (type.toLowerCase()) {
      case DATABASE_TYPES.MONGODB:
        return !!(config.connectionString || (config.host && config.database))

      case DATABASE_TYPES.MYSQL:
      case DATABASE_TYPES.POSTGRESQL:
        return !!(config.connectionString || (config.host && config.database && config.user))

      case DATABASE_TYPES.SQLITE:
        return !!(config.filename || config.database)

      case DATABASE_TYPES.MEMORY:
        return true // Memory adapter doesn't require specific config

      default:
        return false
    }
  }
}

module.exports = DatabaseFactory
module.exports.DATABASE_TYPES = DATABASE_TYPES
