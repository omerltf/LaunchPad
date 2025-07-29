/**
 * @fileoverview Memory Database Adapter
 * @description In-memory database adapter for testing and development
 * @author LaunchPad Template
 * @version 1.0.0
 */

const BaseDatabaseAdapter = require('./BaseDatabaseAdapter')
const { logger } = require('../../utils/logger')

/**
 * Memory Database Adapter
 * Implements in-memory storage for development and testing
 */
class MemoryAdapter extends BaseDatabaseAdapter {
  constructor (config) {
    super(config)
    this.data = new Map() // Collection name -> Array of documents
    this.idCounters = new Map() // Collection name -> current ID counter
  }

  /**
   * Connect to memory storage
   * @returns {Promise<void>}
   */
  async connect () {
    try {
      this.connection = this.data
      this.isConnected = true
      logger.info('Connected to in-memory database')
    } catch (error) {
      logger.error('Failed to connect to memory database:', error)
      throw error
    }
  }

  /**
   * Disconnect from memory storage
   * @returns {Promise<void>}
   */
  async disconnect () {
    try {
      this.connection = null
      this.isConnected = false
      logger.info('Disconnected from in-memory database')
    } catch (error) {
      logger.error('Failed to disconnect from memory database:', error)
      throw error
    }
  }

  /**
   * Execute health check
   * @returns {Promise<boolean>}
   */
  async healthCheck () {
    return this.isConnected
  }

  /**
   * Ensure collection exists
   * @param {string} collection - Collection name
   * @private
   */
  _ensureCollection (collection) {
    if (!this.data.has(collection)) {
      this.data.set(collection, [])
      this.idCounters.set(collection, 0)
    }
  }

  /**
   * Generate next ID for collection
   * @param {string} collection - Collection name
   * @returns {number} Next ID
   * @private
   */
  _getNextId (collection) {
    this._ensureCollection(collection)
    const currentId = this.idCounters.get(collection)
    const nextId = currentId + 1
    this.idCounters.set(collection, nextId)
    return nextId
  }

  /**
   * Create a new record
   * @param {string} collection - Collection name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record
   */
  async create (collection, data) {
    this._ensureCollection(collection)

    const record = {
      id: this._getNextId(collection),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.data.get(collection).push(record)
    return record
  }

  /**
   * Find records
   * @param {string} collection - Collection name
   * @param {Object} query - Query criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async find (collection, query = {}, options = {}) {
    this._ensureCollection(collection)

    let records = this.data.get(collection).filter(record =>
      this._matchesQuery(record, query)
    )

    // Apply sorting
    if (options.sort) {
      records = this._applySort(records, options.sort)
    }

    // Apply pagination
    if (options.skip) {
      records = records.slice(options.skip)
    }

    if (options.limit) {
      records = records.slice(0, options.limit)
    }

    return records
  }

  /**
   * Find a single record by ID
   * @param {string} collection - Collection name
   * @param {string|number} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  async findById (collection, id) {
    this._ensureCollection(collection)

    const record = this.data.get(collection).find(r => r.id === parseInt(id, 10))
    return record || null
  }

  /**
   * Find a single record by query
   * @param {string} collection - Collection name
   * @param {Object} query - Query criteria
   * @returns {Promise<Object|null>} Record or null
   */
  async findOne (collection, query) {
    this._ensureCollection(collection)

    const record = this.data.get(collection).find(record =>
      this._matchesQuery(record, query)
    )
    return record || null
  }

  /**
   * Update records
   * @param {string} collection - Collection name
   * @param {Object} query - Query criteria
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async update (collection, query, update, options = {}) {
    this._ensureCollection(collection)

    const records = this.data.get(collection)
    let modifiedCount = 0

    for (const record of records) {
      if (this._matchesQuery(record, query)) {
        Object.assign(record, update, { updatedAt: new Date() })
        modifiedCount++

        if (options.single) {
          break
        }
      }
    }

    return { modifiedCount }
  }

  /**
   * Update a single record by ID
   * @param {string} collection - Collection name
   * @param {string|number} id - Record ID
   * @param {Object} update - Update data
   * @returns {Promise<Object|null>} Updated record or null
   */
  async updateById (collection, id, update) {
    const record = await this.findById(collection, id)

    if (!record) {
      return null
    }

    Object.assign(record, update, { updatedAt: new Date() })
    return record
  }

  /**
   * Delete records
   * @param {string} collection - Collection name
   * @param {Object} query - Query criteria
   * @returns {Promise<Object>} Delete result
   */
  async delete (collection, query) {
    this._ensureCollection(collection)

    const records = this.data.get(collection)
    const initialLength = records.length

    const filteredRecords = records.filter(record =>
      !this._matchesQuery(record, query)
    )

    this.data.set(collection, filteredRecords)
    const deletedCount = initialLength - filteredRecords.length

    return { deletedCount }
  }

  /**
   * Delete a single record by ID
   * @param {string} collection - Collection name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteById (collection, id) {
    this._ensureCollection(collection)

    const records = this.data.get(collection)
    const initialLength = records.length

    const filteredRecords = records.filter(r => r.id !== parseInt(id, 10))
    this.data.set(collection, filteredRecords)

    return filteredRecords.length < initialLength
  }

  /**
   * Count records
   * @param {string} collection - Collection name
   * @param {Object} query - Query criteria
   * @returns {Promise<number>} Number of records
   */
  async count (collection, query = {}) {
    this._ensureCollection(collection)

    return this.data.get(collection).filter(record =>
      this._matchesQuery(record, query)
    ).length
  }

  /**
   * Execute raw query (not applicable for memory adapter)
   * @param {string} query - Raw query
   * @param {Array} params - Parameters
   * @returns {Promise<*>} Result
   */
  async raw (query, params = []) {
    throw new Error('Raw queries not supported in memory adapter')
  }

  /**
   * Begin transaction (memory adapter doesn't support real transactions)
   * @returns {Promise<Object>} Mock transaction object
   */
  async beginTransaction () {
    return { id: Date.now(), type: 'memory' }
  }

  /**
   * Commit transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction (transaction) {
    // No-op for memory adapter
  }

  /**
   * Rollback transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction (transaction) {
    // No-op for memory adapter
  }

  /**
   * Create collection
   * @param {string} name - Collection name
   * @param {Object} schema - Schema (ignored in memory adapter)
   * @returns {Promise<void>}
   */
  async createCollection (name, schema = {}) {
    this._ensureCollection(name)
  }

  /**
   * Drop collection
   * @param {string} name - Collection name
   * @returns {Promise<void>}
   */
  async dropCollection (name) {
    this.data.delete(name)
    this.idCounters.delete(name)
  }

  /**
   * Check if record matches query
   * @param {Object} record - Record to check
   * @param {Object} query - Query criteria
   * @returns {boolean} True if matches
   * @private
   */
  _matchesQuery (record, query) {
    for (const [key, value] of Object.entries(query)) {
      if (record[key] !== value) {
        return false
      }
    }
    return true
  }

  /**
   * Apply sorting to records
   * @param {Array} records - Records to sort
   * @param {Object} sort - Sort criteria
   * @returns {Array} Sorted records
   * @private
   */
  _applySort (records, sort) {
    return records.sort((a, b) => {
      for (const [key, direction] of Object.entries(sort)) {
        const aVal = a[key]
        const bVal = b[key]

        if (aVal < bVal) {
          return direction === 1 ? -1 : 1
        }
        if (aVal > bVal) {
          return direction === 1 ? 1 : -1
        }
      }
      return 0
    })
  }
}

module.exports = MemoryAdapter
