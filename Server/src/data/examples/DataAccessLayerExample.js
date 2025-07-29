/**
 * @fileoverview Data Access Layer Example
 * @description Example demonstrating how to use the data access layer
 * @author LaunchPad Template
 * @version 1.0.0
 */

const { dataAccessLayer } = require('../index')
const RepositoryFactory = require('../repositories/RepositoryFactory')
const MigrationManager = require('../migrations/MigrationManager')
const { logger } = require('../../utils/logger')

/**
 * Example class demonstrating data access layer usage
 */
class DataAccessLayerExample {
  constructor () {
    this.repositoryFactory = null
    this.migrationManager = null
  }

  /**
   * Initialize the data access layer
   * @returns {Promise<void>}
   */
  async initialize () {
    try {
      // Initialize the data access layer
      await dataAccessLayer.initialize()

      // Create repository factory
      this.repositoryFactory = new RepositoryFactory(dataAccessLayer.getDatabase())

      // Create migration manager
      this.migrationManager = new MigrationManager(
        dataAccessLayer.getDatabase(),
        require('path').join(__dirname, '../migrations')
      )

      logger.info('Data access layer example initialized')
    } catch (error) {
      logger.error('Failed to initialize data access layer example:', error)
      throw error
    }
  }

  /**
   * Run database migrations
   * @returns {Promise<void>}
   */
  async runMigrations () {
    try {
      await this.migrationManager.migrate()
      logger.info('Migrations completed')
    } catch (error) {
      logger.error('Migration failed:', error)
      throw error
    }
  }

  /**
   * Example user operations
   * @returns {Promise<void>}
   */
  async userOperationsExample () {
    try {
      const userRepository = this.repositoryFactory.getUserRepository()

      // Create a user
      const userData = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      }

      const newUser = await userRepository.createUser(userData)
      logger.info('Created user:', newUser)

      // Find user by email
      const foundUser = await userRepository.findByEmail('john@example.com')
      logger.info('Found user by email:', foundUser)

      // Update user profile
      const updatedUser = await userRepository.updateProfile(newUser.id, {
        firstName: 'Jonathan'
      })
      logger.info('Updated user:', updatedUser)

      // Find all active users
      const activeUsers = await userRepository.findActive()
      logger.info('Active users:', activeUsers)

      // Paginate users
      const paginatedUsers = await userRepository.paginate({}, 1, 5)
      logger.info('Paginated users:', paginatedUsers)

      // Check if email exists
      const emailExists = await userRepository.emailExists('john@example.com')
      logger.info('Email exists:', emailExists)

      // Count users
      const userCount = await userRepository.count()
      logger.info('Total users:', userCount)

      return newUser
    } catch (error) {
      logger.error('User operations example failed:', error)
      throw error
    }
  }

  /**
   * Example repository operations
   * @returns {Promise<void>}
   */
  async repositoryOperationsExample () {
    try {
      // Create a custom repository for posts
      const postsRepository = this.repositoryFactory.createRepository('posts', 'posts')

      // Create collection for posts
      await postsRepository.createCollection({
        id: { type: 'integer', primary: true, autoIncrement: true },
        title: { type: 'string', required: true },
        content: { type: 'text' },
        authorId: { type: 'integer', required: true },
        published: { type: 'boolean', default: false },
        createdAt: { type: 'datetime', required: true },
        updatedAt: { type: 'datetime', required: true }
      })

      // Create a post
      const postData = {
        title: 'My First Post',
        content: 'This is the content of my first post.',
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const newPost = await postsRepository.create(postData)
      logger.info('Created post:', newPost)

      // Find posts
      const posts = await postsRepository.find({ published: true })
      logger.info('Published posts:', posts)

      // Update post
      const updatedPost = await postsRepository.updateById(newPost.id, {
        title: 'My Updated First Post',
        updatedAt: new Date()
      })
      logger.info('Updated post:', updatedPost)

      return newPost
    } catch (error) {
      logger.error('Repository operations example failed:', error)
      throw error
    }
  }

  /**
   * Example transaction operations (if supported by adapter)
   * @returns {Promise<void>}
   */
  async transactionExample () {
    try {
      const database = dataAccessLayer.getDatabase()
      let transaction = null

      try {
        transaction = await database.beginTransaction()

        // Perform multiple operations in transaction
        const userRepository = this.repositoryFactory.getUserRepository()

        const user1 = await userRepository.create({
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
          createdAt: new Date(),
          updatedAt: new Date()
        })

        const user2 = await userRepository.create({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
          createdAt: new Date(),
          updatedAt: new Date()
        })

        await database.commitTransaction(transaction)
        logger.info('Transaction committed successfully', { user1, user2 })
      } catch (error) {
        if (transaction) {
          await database.rollbackTransaction(transaction)
          logger.info('Transaction rolled back')
        }
        throw error
      }
    } catch (error) {
      logger.error('Transaction example failed:', error)
      // Don't re-throw if transactions aren't supported
      if (!error.message.includes('not implemented') && !error.message.includes('not supported')) {
        throw error
      }
    }
  }

  /**
   * Health check example
   * @returns {Promise<boolean>}
   */
  async healthCheckExample () {
    try {
      const isHealthy = await dataAccessLayer.healthCheck()
      logger.info('Database health check:', isHealthy ? 'HEALTHY' : 'UNHEALTHY')
      return isHealthy
    } catch (error) {
      logger.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Migration status example
   * @returns {Promise<void>}
   */
  async migrationStatusExample () {
    try {
      const status = await this.migrationManager.getStatus()
      logger.info('Migration status:', status)
    } catch (error) {
      logger.error('Failed to get migration status:', error)
      throw error
    }
  }

  /**
   * Run all examples
   * @returns {Promise<void>}
   */
  async runAllExamples () {
    try {
      await this.initialize()
      await this.runMigrations()
      await this.healthCheckExample()
      await this.migrationStatusExample()
      await this.userOperationsExample()
      await this.repositoryOperationsExample()
      await this.transactionExample()

      logger.info('All data access layer examples completed successfully!')
    } catch (error) {
      logger.error('Data access layer examples failed:', error)
      throw error
    }
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup () {
    try {
      await dataAccessLayer.close()
      logger.info('Data access layer cleanup completed')
    } catch (error) {
      logger.error('Cleanup failed:', error)
      throw error
    }
  }
}

module.exports = DataAccessLayerExample
