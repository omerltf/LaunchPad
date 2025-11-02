const {
  sendSuccess,
  sendError,
  asyncHandler,
  generateId,
  isValidEmail,
  isValidUrl,
  sanitizeString,
  formatDate,
  calculatePagination,
  delay,
  removeSensitiveFields,
  validateRequiredFields
} = require('../src/utils/helpers')

describe('Helper Functions', () => {
  describe('sendSuccess', () => {
    let mockRes

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      }
    })

    it('should send success response with default values', () => {
      const data = { id: 1, name: 'Test' }
      sendSuccess(mockRes, data)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success',
          data,
          timestamp: expect.any(String)
        })
      )
    })

    it('should send success response with custom values', () => {
      const data = { id: 1 }
      sendSuccess(mockRes, data, 'Created', 201, { meta: 'info' })

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Created',
          data,
          meta: 'info'
        })
      )
    })
  })

  describe('sendError', () => {
    let mockRes

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      }
    })

    it('should send error response with default values', () => {
      sendError(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal Server Error',
          timestamp: expect.any(String)
        })
      )
    })

    it('should send error response with custom values', () => {
      sendError(mockRes, 'Not Found', 404, { field: 'id' }, 'NOT_FOUND')

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Not Found',
          details: { field: 'id' },
          code: 'NOT_FOUND'
        })
      )
    })
  })

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const mockNext = jest.fn()
      const wrapped = asyncHandler(mockFn)

      await wrapped({}, {}, mockNext)

      expect(mockFn).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should catch and pass errors to next', async () => {
      const error = new Error('Test error')
      const mockFn = jest.fn().mockRejectedValue(error)
      const mockNext = jest.fn()
      const wrapped = asyncHandler(mockFn)

      await wrapped({}, {}, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe('generateId', () => {
    it('should generate id with default length', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeLessThanOrEqual(9)
    })

    it('should generate id with custom length', () => {
      const id = generateId(5)
      expect(typeof id).toBe('string')
      expect(id.length).toBeLessThanOrEqual(5)
    })

    it('should generate different ids', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
      expect(isValidEmail(undefined)).toBe(false)
    })

    it('should trim whitespace before validation', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true)
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl(null)).toBe(false)
      expect(isValidUrl(undefined)).toBe(false)
      expect(isValidUrl('//invalid')).toBe(false)
    })
  })

  describe('sanitizeString', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>'))
        .toBe('scriptalert("xss")/script')
    })

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")'))
        .toBe('alert("xss")')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world')
    })

    it('should handle empty or invalid inputs', () => {
      expect(sanitizeString('')).toBe('')
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString(undefined)).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format current date when no argument provided', () => {
      const result = formatDate()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })

    it('should format provided date', () => {
      const date = new Date('2025-01-15T12:00:00Z')
      expect(formatDate(date)).toBe('2025-01-15T12:00:00.000Z')
    })

    it('should format date from string', () => {
      expect(formatDate('2025-01-15')).toBe('2025-01-15T00:00:00.000Z')
    })

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid-date')).toThrow('Invalid date provided')
    })
  })

  describe('calculatePagination', () => {
    it('should calculate pagination for first page', () => {
      const result = calculatePagination(1, 10, 50)
      expect(result).toEqual({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        offset: 0,
        hasNextPage: true,
        hasPrevPage: false,
        nextPage: 2,
        prevPage: null
      })
    })

    it('should calculate pagination for middle page', () => {
      const result = calculatePagination(3, 10, 50)
      expect(result).toEqual({
        currentPage: 3,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        offset: 20,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 4,
        prevPage: 2
      })
    })

    it('should calculate pagination for last page', () => {
      const result = calculatePagination(5, 10, 50)
      expect(result).toEqual({
        currentPage: 5,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        offset: 40,
        hasNextPage: false,
        hasPrevPage: true,
        nextPage: null,
        prevPage: 4
      })
    })

    it('should handle invalid page numbers', () => {
      const result = calculatePagination(0, 10, 50)
      expect(result.currentPage).toBe(1)
    })

    it('should limit items per page to 100', () => {
      const result = calculatePagination(1, 200, 50)
      expect(result.itemsPerPage).toBe(100)
    })
  })

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now()
      await delay(100)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(95) // Allow small variance
    })
  })

  describe('removeSensitiveFields', () => {
    it('should remove default sensitive fields', () => {
      const obj = {
        id: 1,
        name: 'John',
        password: 'secret',
        token: 'abc123',
        secret: 'key'
      }
      const result = removeSensitiveFields(obj)
      expect(result).toEqual({ id: 1, name: 'John' })
    })

    it('should remove custom fields', () => {
      const obj = { id: 1, name: 'John', apiKey: 'secret' }
      const result = removeSensitiveFields(obj, ['apiKey'])
      expect(result).toEqual({ id: 1, name: 'John' })
    })

    it('should handle non-object inputs', () => {
      expect(removeSensitiveFields(null)).toBe(null)
      expect(removeSensitiveFields('string')).toBe('string')
    })
  })

  describe('validateRequiredFields', () => {
    it('should validate object with all required fields', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result).toEqual({ isValid: true, missing: [] })
    })

    it('should identify missing fields', () => {
      const data = { name: 'John' }
      const result = validateRequiredFields(data, ['name', 'email', 'age'])
      expect(result).toEqual({
        isValid: false,
        missing: ['email', 'age']
      })
    })

    it('should treat empty strings as missing', () => {
      const data = { name: '', email: 'test@example.com' }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.isValid).toBe(false)
      expect(result.missing).toContain('name')
    })

    it('should handle null and undefined values', () => {
      const data = { name: null, email: undefined }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.isValid).toBe(false)
      expect(result.missing).toEqual(['name', 'email'])
    })

    it('should handle invalid data input', () => {
      const result = validateRequiredFields(null, ['name'])
      expect(result.isValid).toBe(false)
      expect(result.missing).toEqual(['name'])
    })
  })
})
