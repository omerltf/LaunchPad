/**
 * @fileoverview Base Database Adapter
 * @description Abstract base class defining the interface for database adapters
 * @author LaunchPad Template
 * @version 1.0.0
 */

/**
 * Base Database Adapter class
 * Defines the common interface that all database adapters must implement
 */
class BaseDatabaseAdapter {
  constructor (config) {
    this.config = config
    this.connection = null
    this.isConnected = false
  }

  /**
   * Connect to the database
   * @returns {Promise<void>}
   * @abstract
   */
  async connect () {
    throw new Error('connect() method must be implemented by subclass')
  }

  /**
   * Disconnect from the database
   * @returns {Promise<void>}
   * @abstract
   */
  async disconnect () {
    throw new Error('disconnect() method must be implemented by subclass')
  }

  /**
   * Execute a health check
   * @returns {Promise<boolean>}
   * @abstract
   */
  async healthCheck () {
    throw new Error('healthCheck() method must be implemented by subclass')
  }

  /**
   * Create a new record
   * @param {string} collection - Collection/table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record
   * @abstract
   */
  async create (collection, data) {
    throw new Error('create() method must be implemented by subclass')
  }

  /**
   * Find records
   * @param {string} collection - Collection/table name
   * @param {Object} query - Query criteria
   * @param {Object} options - Query options (limit, sort, etc.)
   * @returns {Promise<Array>} Array of records
   * @abstract
   */
  async find (collection, query = {}, options = {}) {
    throw new Error('find() method must be implemented by subclass')
  }

  /**
   * Find a single record by ID
   * @param {string} collection - Collection/table name
   * @param {string|number} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   * @abstract
   */
  async findById (collection, id) {
    throw new Error('findById() method must be implemented by subclass')
  }

  /**
   * Find a single record by query
   * @param {string} collection - Collection/table name
   * @param {Object} query - Query criteria
   * @returns {Promise<Object|null>} Record or null if not found
   * @abstract
   */
  async findOne (collection, query) {
    throw new Error('findOne() method must be implemented by subclass')
  }

  /**
   * Update records
   * @param {string} collection - Collection/table name
   * @param {Object} query - Query criteria
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   * @abstract
   */
  async update (collection, query, update, options = {}) {
    throw new Error('update() method must be implemented by subclass')
  }

  /**
   * Update a single record by ID
   * @param {string} collection - Collection/table name
   * @param {string|number} id - Record ID
   * @param {Object} update - Update data
   * @returns {Promise<Object|null>} Updated record or null if not found
   * @abstract
   */
  async updateById (collection, id, update) {
    throw new Error('updateById() method must be implemented by subclass')
  }

  /**
   * Delete records
   * @param {string} collection - Collection/table name
   * @param {Object} query - Query criteria
   * @returns {Promise<Object>} Delete result
   * @abstract
   */
  async delete (collection, query) {
    throw new Error('delete() method must be implemented by subclass')
  }

  /**
   * Delete a single record by ID
   * @param {string} collection - Collection/table name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @abstract
   */
  async deleteById (collection, id) {
    throw new Error('deleteById() method must be implemented by subclass')
  }

  /**
   * Count records
   * @param {string} collection - Collection/table name
   * @param {Object} query - Query criteria
   * @returns {Promise<number>} Number of records
   * @abstract
   */
  async count (collection, query = {}) {
    throw new Error('count() method must be implemented by subclass')
  }

  /**
   * Execute raw query/command
   * @param {string} query - Raw query string
   * @param {Array} params - Query parameters
   * @returns {Promise<*>} Query result
   * @abstract
   */
  async raw (query, params = []) {
    throw new Error('raw() method must be implemented by subclass')
  }

  /**
   * Begin transaction
   * @returns {Promise<Object>} Transaction object
   * @abstract
   */
  async beginTransaction () {
    throw new Error('beginTransaction() method must be implemented by subclass')
  }

  /**
   * Commit transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   * @abstract
   */
  async commitTransaction (transaction) {
    throw new Error('commitTransaction() method must be implemented by subclass')
  }

  /**
   * Rollback transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   * @abstract
   */
  async rollbackTransaction (transaction) {
    throw new Error('rollbackTransaction() method must be implemented by subclass')
  }

  /**
   * Create collection/table
   * @param {string} name - Collection/table name
   * @param {Object} schema - Schema definition (adapter-specific)
   * @returns {Promise<void>}
   * @abstract
   */
  async createCollection (name, schema = {}) {
    throw new Error('createCollection() method must be implemented by subclass')
  }

  /**
   * Drop collection/table
   * @param {string} name - Collection/table name
   * @returns {Promise<void>}
   * @abstract
   */
  async dropCollection (name) {
    throw new Error('dropCollection() method must be implemented by subclass')
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isReady () {
    return this.isConnected && this.connection !== null
  }

  /**
   * Get connection instance
   * @returns {*} Database connection
   */
  getConnection () {
    return this.connection
  }

  /**
   * Get adapter configuration
   * @returns {Object} Configuration object
   */
  getConfig () {
    return { ...this.config }
  }
}

module.exports = BaseDatabaseAdapter
