#!/usr/bin/env node

/**
 * @fileoverview Database CLI Tool
 * @description Command line interface for database operations
 * @author LaunchPad Template
 * @version 1.0.0
 */

/* eslint-disable no-console */

const { dataAccessLayer } = require('./index')
const MigrationManager = require('./migrations/MigrationManager')
const DataAccessLayerExample = require('./examples/DataAccessLayerExample')

/**
 * Database CLI class
 */
class DatabaseCLI {
  constructor () {
    this.migrationManager = null
  }

  /**
   * Initialize CLI
   * @returns {Promise<void>}
   */
  async initialize () {
    await dataAccessLayer.initialize()
    this.migrationManager = new MigrationManager(
      dataAccessLayer.getDatabase(),
      require('path').join(__dirname, './migrations')
    )
  }

  /**
   * Run migrations
   * @returns {Promise<void>}
   */
  async migrate () {
    console.log('Running database migrations...')
    try {
      await this.migrationManager.migrate()
      console.log('✅ Migrations completed successfully')
    } catch (error) {
      console.error('❌ Migration failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Rollback migrations
   * @returns {Promise<void>}
   */
  async rollback () {
    console.log('Rolling back last migration batch...')
    try {
      await this.migrationManager.rollback()
      console.log('✅ Rollback completed successfully')
    } catch (error) {
      console.error('❌ Rollback failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Show migration status
   * @returns {Promise<void>}
   */
  async status () {
    try {
      const status = await this.migrationManager.getStatus()
      console.log('\n📊 Migration Status:')
      console.log(`Total migrations: ${status.total}`)
      console.log(`Executed: ${status.executed}`)
      console.log(`Pending: ${status.pending}`)

      if (status.pending > 0) {
        console.log('\n📋 Pending migrations:')
        status.pendingMigrations.forEach(migration => {
          console.log(`  - ${migration}`)
        })
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message)
      process.exit(1)
    }
  }

  /**
   * Run health check
   * @returns {Promise<void>}
   */
  async health () {
    try {
      const isHealthy = await dataAccessLayer.healthCheck()
      if (isHealthy) {
        console.log('✅ Database connection is healthy')
      } else {
        console.log('❌ Database connection is unhealthy')
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Health check failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Run examples
   * @returns {Promise<void>}
   */
  async example () {
    console.log('Running data access layer examples...')
    try {
      const example = new DataAccessLayerExample()
      await example.runAllExamples()
      await example.cleanup()
      console.log('✅ Examples completed successfully')
    } catch (error) {
      console.error('❌ Examples failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Show help
   */
  help () {
    console.log(`
📚 Database CLI Tool

Usage: node database-cli.js <command>

Commands:
  migrate   Run pending database migrations
  rollback  Rollback last migration batch
  status    Show migration status
  health    Check database connection health
  example   Run data access layer examples
  help      Show this help message

Examples:
  node database-cli.js migrate
  node database-cli.js status
  node database-cli.js health
`)
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup () {
    try {
      await dataAccessLayer.close()
    } catch (error) {
      console.error('Cleanup failed:', error.message)
    }
  }
}

/**
 * Main function
 */
async function main () {
  const cli = new DatabaseCLI()
  const command = process.argv[2]

  if (!command) {
    cli.help()
    process.exit(0)
  }

  try {
    // Commands that don't need database connection
    if (command === 'help') {
      cli.help()
      process.exit(0)
    }

    // Initialize database connection for other commands
    await cli.initialize()

    switch (command) {
      case 'migrate':
        await cli.migrate()
        break

      case 'rollback':
        await cli.rollback()
        break

      case 'status':
        await cli.status()
        break

      case 'health':
        await cli.health()
        break

      case 'example':
        await cli.example()
        break

      default:
        console.error(`❌ Unknown command: ${command}`)
        cli.help()
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ CLI error:', error.message)
    process.exit(1)
  } finally {
    await cli.cleanup()
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })
}

module.exports = DatabaseCLI
