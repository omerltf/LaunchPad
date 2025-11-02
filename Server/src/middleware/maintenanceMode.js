/**
 * @fileoverview Maintenance Mode Middleware
 * @description Middleware to handle requests during maintenance mode
 * @author LaunchPad
 * @version 1.0.0
 */

const { logger } = require('../utils/logger')

/**
 * Maintenance mode middleware factory
 * @param {MaintenanceManager} maintenanceManager - Instance of MaintenanceManager
 * @param {object} options - Configuration options
 * @returns {Function} Express middleware
 */
const createMaintenanceMiddleware = (maintenanceManager, options = {}) => {
  const {
    // Paths that should always work even during maintenance
    whitelist = [
      '/health',
      '/maintenance',
      '/maintenance/toggle',
      '/maintenance/status',
      '/maintenance/message'
    ],
    // Custom response for maintenance mode
    customResponse = null
  } = options

  return async (req, res, next) => {
    try {
      // Check if path is whitelisted
      const isWhitelisted = whitelist.some(path => req.path.startsWith(path))

      if (isWhitelisted) {
        return next()
      }

      // Check maintenance mode status
      const isEnabled = await maintenanceManager.isEnabled()

      if (!isEnabled) {
        return next()
      }

      // Maintenance mode is active - block request
      const status = await maintenanceManager.getStatus()

      logger.warn('Request blocked due to maintenance mode', {
        path: req.path,
        method: req.method,
        ip: req.ip
      })

      // Send custom response or default
      if (customResponse && typeof customResponse === 'function') {
        return customResponse(req, res, status)
      }

      // Default 503 response
      return res.status(503).json({
        error: 'Service Unavailable',
        message: status.message,
        maintenanceMode: true,
        retryAfter: '3600', // Suggest retry after 1 hour
        timestamp: new Date().toISOString(),
        code: 'MAINTENANCE_MODE'
      })
    } catch (error) {
      logger.error('Error in maintenance middleware', error)
      // On error, allow request through (fail open)
      next()
    }
  }
}

module.exports = { createMaintenanceMiddleware }
