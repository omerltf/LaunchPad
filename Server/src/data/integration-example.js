/**
 * @fileoverview Data Access Layer Integration Example
 * @description Example showing how to integrate the data access layer with Express routes
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { dataAccessLayer } = require('../data')
const RepositoryFactory = require('../data/repositories/RepositoryFactory')
const { logger } = require('../utils/logger')

/**
 * Setup data access layer middleware and routes
 * @param {Object} app - Express application
 * @returns {Promise<void>}
 */
async function setupDataAccessLayer (app) {
  try {
    // Initialize data access layer
    await dataAccessLayer.initialize()

    // Create repository factory
    const repositoryFactory = new RepositoryFactory(dataAccessLayer.getDatabase())

    // Make repositories available to routes
    app.locals.repositories = repositoryFactory

    // Add data access layer health check endpoint
    app.get('/api/health/database', async (req, res) => {
      try {
        const isHealthy = await dataAccessLayer.healthCheck()
        res.json({
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          database: {
            type: dataAccessLayer.getDatabase().constructor.name,
            connected: dataAccessLayer.isReady()
          }
        })
      } catch (error) {
        logger.error('Database health check failed:', error)
        res.status(503).json({
          status: 'error',
          message: 'Database health check failed',
          timestamp: new Date().toISOString()
        })
      }
    })

    // Example user management endpoints
    app.get('/api/users', async (req, res) => {
      try {
        const userRepository = repositoryFactory.getUserRepository()
        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 10

        const result = await userRepository.paginate({}, page, limit)

        // Sanitize user data (remove passwords)
        result.data = result.data.map(user => {
          const { password, ...sanitizedUser } = user
          return sanitizedUser
        })

        res.json(result)
      } catch (error) {
        logger.error('Failed to get users:', error)
        res.status(500).json({
          error: 'Failed to retrieve users',
          message: error.message
        })
      }
    })

    app.get('/api/users/:id', async (req, res) => {
      try {
        const userRepository = repositoryFactory.getUserRepository()
        const user = await userRepository.findById(req.params.id)

        if (!user) {
          return res.status(404).json({
            error: 'User not found'
          })
        }

        // Sanitize user data
        const { password, ...sanitizedUser } = user
        res.json(sanitizedUser)
      } catch (error) {
        logger.error('Failed to get user:', error)
        res.status(500).json({
          error: 'Failed to retrieve user',
          message: error.message
        })
      }
    })

    app.post('/api/users', async (req, res) => {
      try {
        const userRepository = repositoryFactory.getUserRepository()
        const { username, email, firstName, lastName, role } = req.body

        // Basic validation
        if (!username || !email) {
          return res.status(400).json({
            error: 'Username and email are required'
          })
        }

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email)
        if (existingUser) {
          return res.status(409).json({
            error: 'User with this email already exists'
          })
        }

        // Create user
        const userData = {
          username,
          email,
          password: 'temp_password_' + Date.now(), // In real app, hash the password
          firstName,
          lastName,
          role: role || 'user'
        }

        const newUser = await userRepository.createUser(userData)

        // Sanitize response
        const { password, ...sanitizedUser } = newUser
        res.status(201).json(sanitizedUser)
      } catch (error) {
        logger.error('Failed to create user:', error)
        res.status(500).json({
          error: 'Failed to create user',
          message: error.message
        })
      }
    })

    app.put('/api/users/:id', async (req, res) => {
      try {
        const userRepository = repositoryFactory.getUserRepository()
        const { firstName, lastName, role } = req.body

        const updatedUser = await userRepository.updateProfile(req.params.id, {
          firstName,
          lastName,
          role
        })

        if (!updatedUser) {
          return res.status(404).json({
            error: 'User not found'
          })
        }

        // Sanitize response
        const { password, ...sanitizedUser } = updatedUser
        res.json(sanitizedUser)
      } catch (error) {
        logger.error('Failed to update user:', error)
        res.status(500).json({
          error: 'Failed to update user',
          message: error.message
        })
      }
    })

    app.delete('/api/users/:id', async (req, res) => {
      try {
        const userRepository = repositoryFactory.getUserRepository()
        const deleted = await userRepository.deleteById(req.params.id)

        if (!deleted) {
          return res.status(404).json({
            error: 'User not found'
          })
        }

        res.status(204).send()
      } catch (error) {
        logger.error('Failed to delete user:', error)
        res.status(500).json({
          error: 'Failed to delete user',
          message: error.message
        })
      }
    })

    logger.info('Data access layer integration completed')
  } catch (error) {
    logger.error('Failed to setup data access layer:', error)
    throw error
  }
}

/**
 * Cleanup data access layer on application shutdown
 * @returns {Promise<void>}
 */
async function cleanupDataAccessLayer () {
  try {
    await dataAccessLayer.close()
    logger.info('Data access layer cleanup completed')
  } catch (error) {
    logger.error('Data access layer cleanup failed:', error)
  }
}

module.exports = {
  setupDataAccessLayer,
  cleanupDataAccessLayer
}
