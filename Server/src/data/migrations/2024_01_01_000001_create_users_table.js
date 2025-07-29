/**
 * @fileoverview Create Users Table Migration
 * @description Initial migration to create users table
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { logger } = require('../../utils/logger')

/**
 * Create users table
 * @param {Object} database - Database adapter instance
 * @returns {Promise<void>}
 */
async function up (database) {
  // Create users table/collection
  await database.createCollection('users', {
    id: {
      type: 'integer',
      primary: true,
      autoIncrement: true
    },
    username: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 50
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 255
    },
    password: {
      type: 'string',
      required: true
    },
    firstName: {
      type: 'string',
      maxLength: 50
    },
    lastName: {
      type: 'string',
      maxLength: 50
    },
    role: {
      type: 'string',
      default: 'user'
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    lastLoginAt: {
      type: 'datetime',
      nullable: true
    },
    createdAt: {
      type: 'datetime',
      required: true
    },
    updatedAt: {
      type: 'datetime',
      required: true
    },
    deactivatedAt: {
      type: 'datetime',
      nullable: true
    },
    activatedAt: {
      type: 'datetime',
      nullable: true
    }
  })

  logger.info('Created users table')
}

/**
 * Drop users table
 * @param {Object} database - Database adapter instance
 * @returns {Promise<void>}
 */
async function down (database) {
  await database.dropCollection('users')
  logger.info('Dropped users table')
}

module.exports = {
  up,
  down
}
