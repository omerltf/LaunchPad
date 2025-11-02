const { createMaintenanceMiddleware } = require('../src/middleware/maintenanceMode')

describe('Maintenance Mode Middleware', () => {
  let mockMaintenanceManager
  let mockReq
  let mockRes
  let mockNext

  beforeEach(() => {
    // Mock MaintenanceManager
    mockMaintenanceManager = {
      isEnabled: jest.fn(),
      getStatus: jest.fn()
    }

    // Mock Express request
    mockReq = {
      path: '/api/users',
      method: 'GET',
      ip: '127.0.0.1'
    }

    // Mock Express response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    // Mock next function
    mockNext = jest.fn()
  })

  describe('Whitelisted paths', () => {
    it('should allow /health requests', async () => {
      mockReq.path = '/health'
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockMaintenanceManager.isEnabled).not.toHaveBeenCalled()
    })

    it('should allow /maintenance requests', async () => {
      mockReq.path = '/maintenance'
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockMaintenanceManager.isEnabled).not.toHaveBeenCalled()
    })

    it('should allow /maintenance/toggle requests', async () => {
      mockReq.path = '/maintenance/toggle'
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should allow custom whitelisted paths', async () => {
      mockReq.path = '/custom/path'
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager, {
        whitelist: ['/custom/path']
      })

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockMaintenanceManager.isEnabled).not.toHaveBeenCalled()
    })
  })

  describe('Maintenance mode disabled', () => {
    it('should allow requests when maintenance is disabled', async () => {
      mockMaintenanceManager.isEnabled.mockResolvedValue(false)
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockMaintenanceManager.isEnabled).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })

  describe('Maintenance mode enabled', () => {
    beforeEach(() => {
      mockMaintenanceManager.isEnabled.mockResolvedValue(true)
      mockMaintenanceManager.getStatus.mockResolvedValue({
        enabled: true,
        message: 'System under maintenance',
        lastModified: '2025-11-02T00:00:00.000Z'
      })
    })

    it('should block requests with 503 status', async () => {
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(503)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Service Unavailable',
          maintenanceMode: true,
          code: 'MAINTENANCE_MODE'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should include maintenance message in response', async () => {
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'System under maintenance'
        })
      )
    })

    it('should include retry-after header suggestion', async () => {
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: '3600'
        })
      )
    })

    it('should use custom response when provided', async () => {
      const customResponse = jest.fn()
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager, {
        customResponse
      })

      await middleware(mockReq, mockRes, mockNext)

      expect(customResponse).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        expect.objectContaining({
          enabled: true,
          message: 'System under maintenance'
        })
      )
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should fail open when isEnabled throws error', async () => {
      mockMaintenanceManager.isEnabled.mockRejectedValue(
        new Error('Database connection failed')
      )
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should fail open when getStatus throws error', async () => {
      mockMaintenanceManager.isEnabled.mockResolvedValue(true)
      mockMaintenanceManager.getStatus.mockRejectedValue(
        new Error('Failed to get status')
      )
      const middleware = createMaintenanceMiddleware(mockMaintenanceManager)

      await middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })
})
