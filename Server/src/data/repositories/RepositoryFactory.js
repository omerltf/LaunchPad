/**
 * @fileoverview Repository Factory
 * @description Factory for creating repository instances
 * @author LaunchPad Template
 * @version 1.0.0
 */

const UserRepository = require('./UserRepository')
// Import other repositories as they are created
// const PostRepository = require('./PostRepository')
// const CommentRepository = require('./CommentRepository')

/**
 * Repository Factory class
 * Creates and manages repository instances
 */
class RepositoryFactory {
  constructor (database) {
    this.database = database
    this.repositories = new Map()
  }

  /**
   * Get User repository
   * @returns {UserRepository} User repository instance
   */
  getUserRepository () {
    if (!this.repositories.has('user')) {
      this.repositories.set('user', new UserRepository(this.database))
    }
    return this.repositories.get('user')
  }

  /**
   * Get repository by name
   * @param {string} name - Repository name
   * @returns {BaseRepository} Repository instance
   */
  getRepository (name) {
    switch (name.toLowerCase()) {
      case 'user':
      case 'users':
        return this.getUserRepository()

        // Add other repositories here as they are created
        // case 'post':
        // case 'posts':
        //   return this.getPostRepository()

      default:
        throw new Error(`Repository '${name}' not found`)
    }
  }

  /**
   * Create custom repository
   * @param {string} name - Repository name
   * @param {string} collectionName - Collection/table name
   * @returns {BaseRepository} Repository instance
   */
  createRepository (name, collectionName) {
    const BaseRepository = require('./BaseRepository')
    const repository = new BaseRepository(this.database, collectionName)
    this.repositories.set(name, repository)
    return repository
  }

  /**
   * Get all registered repositories
   * @returns {Map} Map of repository instances
   */
  getAllRepositories () {
    return new Map(this.repositories)
  }

  /**
   * Clear all repository instances
   */
  clear () {
    this.repositories.clear()
  }
}

module.exports = RepositoryFactory
