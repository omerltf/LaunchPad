/**
 * @fileoverview Base Repository
 * @description Abstract base repository class providing common data access patterns
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { logger } = require('../../utils/logger')

/**
 * Base Repository class
 * Provides common data access patterns and methods
 */
class BaseRepository {
  constructor (database, collectionName) {
    this.database = database
    this.collectionName = collectionName
  }

  /**
   * Create a new record
   * @param {Object} data - Data to create
   * @returns {Promise<Object>} Created record
   */
  async create (data) {
    try {
      const result = await this.database.create(this.collectionName, data)
      logger.info(`Created record in ${this.collectionName}`, { id: result.id })
      return result
    } catch (error) {
      logger.error(`Failed to create record in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Find records by query
   * @param {Object} query - Query criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async find (query = {}, options = {}) {
    try {
      return await this.database.find(this.collectionName, query, options)
    } catch (error) {
      logger.error(`Failed to find records in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Find all records
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of all records
   */
  async findAll (options = {}) {
    return this.find({}, options)
  }

  /**
   * Find record by ID
   * @param {string|number} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  async findById (id) {
    try {
      return await this.database.findById(this.collectionName, id)
    } catch (error) {
      logger.error(`Failed to find record by ID in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Find one record by query
   * @param {Object} query - Query criteria
   * @returns {Promise<Object|null>} Record or null
   */
  async findOne (query) {
    try {
      return await this.database.findOne(this.collectionName, query)
    } catch (error) {
      logger.error(`Failed to find one record in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Update records
   * @param {Object} query - Query criteria
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async update (query, update, options = {}) {
    try {
      const result = await this.database.update(this.collectionName, query, update, options)
      logger.info(`Updated records in ${this.collectionName}`, { modifiedCount: result.modifiedCount })
      return result
    } catch (error) {
      logger.error(`Failed to update records in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Update record by ID
   * @param {string|number} id - Record ID
   * @param {Object} update - Update data
   * @returns {Promise<Object|null>} Updated record or null
   */
  async updateById (id, update) {
    try {
      const result = await this.database.updateById(this.collectionName, id, update)
      if (result) {
        logger.info(`Updated record by ID in ${this.collectionName}`, { id })
      }
      return result
    } catch (error) {
      logger.error(`Failed to update record by ID in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Delete records
   * @param {Object} query - Query criteria
   * @returns {Promise<Object>} Delete result
   */
  async delete (query) {
    try {
      const result = await this.database.delete(this.collectionName, query)
      logger.info(`Deleted records from ${this.collectionName}`, { deletedCount: result.deletedCount })
      return result
    } catch (error) {
      logger.error(`Failed to delete records from ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Delete record by ID
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteById (id) {
    try {
      const result = await this.database.deleteById(this.collectionName, id)
      if (result) {
        logger.info(`Deleted record by ID from ${this.collectionName}`, { id })
      }
      return result
    } catch (error) {
      logger.error(`Failed to delete record by ID from ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Count records
   * @param {Object} query - Query criteria
   * @returns {Promise<number>} Number of records
   */
  async count (query = {}) {
    try {
      return await this.database.count(this.collectionName, query)
    } catch (error) {
      logger.error(`Failed to count records in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Check if record exists
   * @param {Object} query - Query criteria
   * @returns {Promise<boolean>} True if exists
   */
  async exists (query) {
    const count = await this.count(query)
    return count > 0
  }

  /**
   * Get paginated results
   * @param {Object} query - Query criteria
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Records per page
   * @param {Object} sort - Sort criteria
   * @returns {Promise<Object>} Paginated result
   */
  async paginate (query = {}, page = 1, limit = 10, sort = {}) {
    try {
      const skip = (page - 1) * limit
      const options = { skip, limit, sort }

      const [data, total] = await Promise.all([
        this.find(query, options),
        this.count(query)
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error(`Failed to paginate records in ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Create collection/table
   * @param {Object} schema - Schema definition
   * @returns {Promise<void>}
   */
  async createCollection (schema = {}) {
    try {
      await this.database.createCollection(this.collectionName, schema)
      logger.info(`Created collection ${this.collectionName}`)
    } catch (error) {
      logger.error(`Failed to create collection ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Drop collection/table
   * @returns {Promise<void>}
   */
  async dropCollection () {
    try {
      await this.database.dropCollection(this.collectionName)
      logger.info(`Dropped collection ${this.collectionName}`)
    } catch (error) {
      logger.error(`Failed to drop collection ${this.collectionName}:`, error)
      throw error
    }
  }
}

module.exports = BaseRepository
