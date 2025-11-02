/**
 * @fileoverview API v1 Routes
 * @description Version 1 API routes aggregator
 * @author LaunchPad Template
 * @version 1.0.0
 */

const express = require('express')
const authRoutes = require('./auth')
const userRoutes = require('./users')

const router = express.Router()

// Mount route modules
router.use('/auth', authRoutes)
router.use('/users', userRoutes)

// API v1 info endpoint
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    message: 'LaunchPad API v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users'
    }
  })
})

module.exports = router
