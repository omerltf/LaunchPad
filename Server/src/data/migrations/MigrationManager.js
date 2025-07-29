/**
 * @fileoverview Migration System
 * @description Database migration system for schema management
 * @author LaunchPad Template
 * @version 1.0.0
 */

const path = require('path')
const fs = require('fs').promises
const { logger } = require('../../utils/logger')

/**
 * Migration Manager class
 * Handles database schema migrations
 */
class MigrationManager {
  constructor (database, migrationsPath = __dirname) {
    this.database = database
    this.migrationsPath = migrationsPath
    this.migrationsTable = 'migrations'
  }

  /**
   * Initialize migration system
   * Creates migrations table if it doesn't exist
   * @returns {Promise<void>}
   */
  async initialize () {
    try {
      // Create migrations tracking table
      await this.database.createCollection(this.migrationsTable, {
        id: { type: 'integer', primary: true, autoIncrement: true },
        name: { type: 'string', required: true, unique: true },
        batch: { type: 'integer', required: true },
        executedAt: { type: 'datetime', required: true }
      })

      logger.info('Migration system initialized')
    } catch (error) {
      // Table might already exist - check if it's a "already exists" error
      if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
        logger.error('Failed to initialize migration system:', error)
        throw error
      }
    }
  }

  /**
   * Get list of migration files
   * @returns {Promise<Array>} Array of migration files
   */
  async getMigrationFiles () {
    try {
      const files = await fs.readdir(this.migrationsPath)
      return files
        .filter(file => file.endsWith('.js') && file.match(/^\d{4}_\d{2}_\d{2}_\d{6}_/))
        .sort()
    } catch (error) {
      logger.error('Failed to read migration files:', error)
      return []
    }
  }

  /**
   * Get executed migrations from database
   * @returns {Promise<Array>} Array of executed migration names
   */
  async getExecutedMigrations () {
    try {
      const migrations = await this.database.find(this.migrationsTable, {}, { sort: { name: 1 } })
      return migrations.map(m => m.name)
    } catch (error) {
      logger.error('Failed to get executed migrations:', error)
      return []
    }
  }

  /**
   * Get pending migrations
   * @returns {Promise<Array>} Array of pending migration files
   */
  async getPendingMigrations () {
    const [migrationFiles, executedMigrations] = await Promise.all([
      this.getMigrationFiles(),
      this.getExecutedMigrations()
    ])

    return migrationFiles.filter(file => {
      const migrationName = path.basename(file, '.js')
      return !executedMigrations.includes(migrationName)
    })
  }

  /**
   * Run pending migrations
   * @returns {Promise<void>}
   */
  async migrate () {
    try {
      await this.initialize()

      const pendingMigrations = await this.getPendingMigrations()

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations')
        return
      }

      logger.info(`Running ${pendingMigrations.length} pending migrations`)

      // Get next batch number
      const lastMigration = await this.database.findOne(
        this.migrationsTable,
        {},
        { sort: { batch: -1 } }
      )
      const nextBatch = lastMigration ? lastMigration.batch + 1 : 1

      for (const migrationFile of pendingMigrations) {
        await this.runMigration(migrationFile, nextBatch)
      }

      logger.info('All migrations completed successfully')
    } catch (error) {
      logger.error('Migration failed:', error)
      throw error
    }
  }

  /**
   * Run a single migration
   * @param {string} migrationFile - Migration file name
   * @param {number} batch - Batch number
   * @returns {Promise<void>}
   */
  async runMigration (migrationFile, batch) {
    const migrationPath = path.join(this.migrationsPath, migrationFile)
    const migrationName = path.basename(migrationFile, '.js')

    try {
      logger.info(`Running migration: ${migrationName}`)

      // Load and execute migration
      const migration = require(migrationPath)

      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${migrationName} must export an 'up' function`)
      }

      // Execute migration within transaction if supported
      let transaction = null
      try {
        transaction = await this.database.beginTransaction()
      } catch (error) {
        // Transaction not supported - continue without it
      }

      try {
        await migration.up(this.database)

        // Record migration execution
        await this.database.create(this.migrationsTable, {
          name: migrationName,
          batch,
          executedAt: new Date()
        })

        if (transaction) {
          await this.database.commitTransaction(transaction)
        }

        logger.info(`Migration completed: ${migrationName}`)
      } catch (error) {
        if (transaction) {
          await this.database.rollbackTransaction(transaction)
        }
        throw error
      }
    } catch (error) {
      logger.error(`Migration failed: ${migrationName}`, error)
      throw error
    }
  }

  /**
   * Rollback last batch of migrations
   * @returns {Promise<void>}
   */
  async rollback () {
    try {
      // Get last batch
      const lastMigration = await this.database.findOne(
        this.migrationsTable,
        {},
        { sort: { batch: -1 } }
      )

      if (!lastMigration) {
        logger.info('No migrations to rollback')
        return
      }

      const lastBatch = lastMigration.batch
      const migrationsToRollback = await this.database.find(
        this.migrationsTable,
        { batch: lastBatch },
        { sort: { name: -1 } }
      )

      logger.info(`Rolling back ${migrationsToRollback.length} migrations from batch ${lastBatch}`)

      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration.name)
      }

      logger.info('Rollback completed successfully')
    } catch (error) {
      logger.error('Rollback failed:', error)
      throw error
    }
  }

  /**
   * Rollback a single migration
   * @param {string} migrationName - Migration name
   * @returns {Promise<void>}
   */
  async rollbackMigration (migrationName) {
    const migrationFile = `${migrationName}.js`
    const migrationPath = path.join(this.migrationsPath, migrationFile)

    try {
      logger.info(`Rolling back migration: ${migrationName}`)

      // Check if migration file exists
      try {
        await fs.access(migrationPath)
      } catch (error) {
        throw new Error(`Migration file not found: ${migrationFile}`)
      }

      // Load and execute rollback
      const migration = require(migrationPath)

      if (typeof migration.down !== 'function') {
        throw new Error(`Migration ${migrationName} must export a 'down' function for rollback`)
      }

      // Execute rollback within transaction if supported
      let transaction = null
      try {
        transaction = await this.database.beginTransaction()
      } catch (error) {
        // Transaction not supported - continue without it
      }

      try {
        await migration.down(this.database)

        // Remove migration record
        await this.database.delete(this.migrationsTable, { name: migrationName })

        if (transaction) {
          await this.database.commitTransaction(transaction)
        }

        logger.info(`Migration rolled back: ${migrationName}`)
      } catch (error) {
        if (transaction) {
          await this.database.rollbackTransaction(transaction)
        }
        throw error
      }
    } catch (error) {
      logger.error(`Migration rollback failed: ${migrationName}`, error)
      throw error
    }
  }

  /**
   * Get migration status
   * @returns {Promise<Object>} Migration status information
   */
  async getStatus () {
    const [migrationFiles, executedMigrations] = await Promise.all([
      this.getMigrationFiles(),
      this.getExecutedMigrations()
    ])

    const pending = migrationFiles.filter(file => {
      const migrationName = path.basename(file, '.js')
      return !executedMigrations.includes(migrationName)
    })

    return {
      total: migrationFiles.length,
      executed: executedMigrations.length,
      pending: pending.length,
      pendingMigrations: pending
    }
  }
}

module.exports = MigrationManager
