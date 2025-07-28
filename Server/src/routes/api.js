/**
 * @fileoverview API routes for the application
 * @description RESTful API endpoints with proper error handling and validation
 * @author Template Generator
 * @version 1.0.0
 */

const express = require('express')
const {
  sendSuccess,
  sendError,
  asyncHandler,
  calculatePagination
} = require('../utils/helpers')
const { logger } = require('../utils/logger')
const { validateInput, rateLimit } = require('../middleware')
const { config } = require('../config')

const router = express.Router()

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database
const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    active: true
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-16').toISOString(),
    active: true
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-17').toISOString(),
    active: false
  }
]

// Counter for generating new user IDs
let nextUserId = users.length + 1

/**
 * @route GET /api/
 * @description Get API information and available endpoints
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
  logger.info('API info requested', { ip: req.ip })

  sendSuccess(res, {
    name: 'Node.js Template API',
    version: config.api.version,
    description: 'A well-structured Node.js API template with Express.js',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users with pagination and filtering',
        'GET /api/users/:id': 'Get a specific user by ID',
        'POST /api/users': 'Create a new user',
        'PUT /api/users/:id': 'Update an existing user',
        'DELETE /api/users/:id': 'Delete a user'
      },
      health: {
        'GET /health': 'Check application health status'
      }
    },
    features: [
      'Input validation',
      'Rate limiting',
      'Error handling',
      'Logging',
      'CORS support',
      'Security headers'
    ]
  }, 'API information retrieved successfully')
}))

/**
 * @route GET /api/users
 * @description Get users with pagination, filtering, and sorting
 * @access Public
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10, max: 100)
 * @query {string} search - Search in name and email
 * @query {string} sort - Sort field (name, email, createdAt)
 * @query {string} order - Sort order (asc, desc)
 * @query {boolean} active - Filter by active status
 */
router.get('/users', rateLimit(), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sort = 'createdAt',
    order = 'desc',
    active
  } = req.query

  logger.info('Users list requested', {
    page,
    limit,
    search,
    sort,
    order,
    active,
    ip: req.ip
  })

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))

  let filteredUsers = [...users]

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase()
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  }

  // Filter by active status
  if (active !== undefined) {
    const isActive = active === 'true'
    filteredUsers = filteredUsers.filter(user => user.active === isActive)
  }

  // Sort users
  const validSortFields = ['name', 'email', 'createdAt', 'updatedAt']
  const sortField = validSortFields.includes(sort) ? sort : 'createdAt'
  const sortOrder = order === 'asc' ? 1 : -1

  filteredUsers.sort((a, b) => {
    if (a[sortField] < b[sortField]) return -1 * sortOrder
    if (a[sortField] > b[sortField]) return 1 * sortOrder
    return 0
  })

  // Calculate pagination
  const pagination = calculatePagination(pageNum, limitNum, filteredUsers.length)

  // Apply pagination
  const paginatedUsers = filteredUsers.slice(
    pagination.offset,
    pagination.offset + pagination.itemsPerPage
  )

  sendSuccess(res, {
    users: paginatedUsers,
    pagination,
    filters: {
      search,
      active: active !== undefined ? active === 'true' : undefined,
      sort: sortField,
      order
    }
  }, `Retrieved ${paginatedUsers.length} users`)
}))

/**
 * @route GET /api/users/:id
 * @description Get a specific user by ID
 * @access Public
 * @param {number} id - User ID
 */
router.get('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return sendError(res, 'Invalid user ID format', 400, null, 'INVALID_ID')
  }

  const user = users.find(u => u.id === userId)

  if (!user) {
    return sendError(res, 'User not found', 404, null, 'USER_NOT_FOUND')
  }

  logger.info('User retrieved', { userId, ip: req.ip })
  sendSuccess(res, { user }, 'User retrieved successfully')
}))

/**
 * User validation schema
 */
const userValidationSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    type: 'email',
    maxLength: 100
  }
}

/**
 * @route POST /api/users
 * @description Create a new user
 * @access Public
 * @body {string} name - User's full name (2-50 characters, letters and spaces only)
 * @body {string} email - User's email address
 */
router.post('/users', rateLimit({ max: 10 }), validateInput(userValidationSchema), asyncHandler(async (req, res) => {
  const { name, email } = req.body

  // Check if email already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return sendError(res, 'Email already exists', 409, null, 'EMAIL_EXISTS')
  }

  // Create new user
  const newUser = {
    id: nextUserId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  }

  users.push(newUser)

  logger.info('User created', {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    ip: req.ip
  })

  sendSuccess(res, { user: newUser }, 'User created successfully', 201)
}))

/**
 * User update validation schema (all fields optional)
 */
const userUpdateValidationSchema = {
  name: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: false,
    type: 'email',
    maxLength: 100
  },
  active: {
    required: false,
    type: 'boolean'
  }
}

/**
 * @route PUT /api/users/:id
 * @description Update an existing user
 * @access Public
 * @param {number} id - User ID
 * @body {string} [name] - User's full name (optional)
 * @body {string} [email] - User's email address (optional)
 * @body {boolean} [active] - User's active status (optional)
 */
router.put('/users/:id', rateLimit({ max: 20 }), validateInput(userUpdateValidationSchema), asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return sendError(res, 'Invalid user ID format', 400, null, 'INVALID_ID')
  }

  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex === -1) {
    return sendError(res, 'User not found', 404, null, 'USER_NOT_FOUND')
  }

  const { name, email, active } = req.body

  // Check if email already exists (excluding current user)
  if (email) {
    const existingUser = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.id !== userId
    )
    if (existingUser) {
      return sendError(res, 'Email already exists', 409, null, 'EMAIL_EXISTS')
    }
  }

  // Update user
  const updatedUser = {
    ...users[userIndex],
    ...(name && { name: name.trim() }),
    ...(email && { email: email.toLowerCase().trim() }),
    ...(active !== undefined && { active }),
    updatedAt: new Date().toISOString()
  }

  users[userIndex] = updatedUser

  logger.info('User updated', {
    userId,
    changes: { name, email, active },
    ip: req.ip
  })

  sendSuccess(res, { user: updatedUser }, 'User updated successfully')
}))

/**
 * @route DELETE /api/users/:id
 * @description Delete a user
 * @access Public
 * @param {number} id - User ID
 */
router.delete('/users/:id', rateLimit({ max: 5 }), asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return sendError(res, 'Invalid user ID format', 400, null, 'INVALID_ID')
  }

  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex === -1) {
    return sendError(res, 'User not found', 404, null, 'USER_NOT_FOUND')
  }

  const deletedUser = users.splice(userIndex, 1)[0]

  logger.info('User deleted', {
    userId,
    name: deletedUser.name,
    email: deletedUser.email,
    ip: req.ip
  })

  sendSuccess(res, { user: deletedUser }, 'User deleted successfully')
}))

module.exports = router
