/**
 * @fileoverview Authentication System Unit Tests
 * @description Tests for authentication utilities, services, and middleware
 * @author LaunchPad Template
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken')
const { config } = require('../src/config')
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractToken,
  validatePasswordStrength,
  sanitizeUser
} = require('../src/utils/auth')
const { AppError, AuthenticationError, ValidationError } = require('../src/utils/errors')

// Mock bcrypt to be fast in tests
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(() => Promise.resolve('$2a$04$mockedsalt')),
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => {
    return Promise.resolve(hash === `hashed_${password}`)
  })
}))

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).toBe(`hashed_${password}`)
    })

    it('should verify correct password', async () => {
      const password = 'TestPassword123!'
      const hashed = await hashPassword(password)
      const isValid = await comparePassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const hashed = await hashPassword(password)
      const isValid = await comparePassword(wrongPassword, hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('Password Strength Validation', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129) + 'A1!'
      const result = validatePasswordStrength(longPassword)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must not exceed 128 characters')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without number', () => {
      const result = validatePasswordStrength('NoNumbers!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('NoSpecial123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })

  describe('JWT Token Generation', () => {
    it('should generate access token', () => {
      const payload = { userId: 1, email: 'test@example.com', role: 'user' }
      const token = generateAccessToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      // Verify token
      const decoded = jwt.verify(token, config.security.jwtSecret)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
      expect(decoded.type).toBe('access')
    })

    it('should generate refresh token', () => {
      const payload = { userId: 1 }
      const token = generateRefreshToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      // Verify token
      const decoded = jwt.verify(token, config.security.jwtSecret)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.type).toBe('refresh')
    })
  })

  describe('JWT Token Verification', () => {
    it('should verify valid access token', () => {
      const payload = { userId: 1, email: 'test@example.com', role: 'user' }
      const token = generateAccessToken(payload)

      const decoded = verifyToken(token, 'access')
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })

    it('should verify valid refresh token', () => {
      const payload = { userId: 1 }
      const token = generateRefreshToken(payload)

      const decoded = verifyToken(token, 'refresh')
      expect(decoded.userId).toBe(payload.userId)
    })

    it('should reject token with wrong type', () => {
      const payload = { userId: 1 }
      const accessToken = generateAccessToken(payload)

      expect(() => {
        verifyToken(accessToken, 'refresh')
      }).toThrow(AppError)
    })

    it('should reject invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here', 'access')
      }).toThrow(AppError)
    })

    it('should reject expired token', () => {
      const payload = { userId: 1, email: 'test@example.com' }
      const expiredToken = jwt.sign(
        { ...payload, type: 'access' },
        config.security.jwtSecret,
        { expiresIn: '0s' }
      )

      expect(() => {
        verifyToken(expiredToken, 'access')
      }).toThrow(AppError)
    })
  })

  describe('Token Extraction', () => {
    it('should extract token from Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      const authHeader = `Bearer ${token}`

      const extracted = extractToken(authHeader)
      expect(extracted).toBe(token)
    })

    it('should return null for invalid format', () => {
      const extracted = extractToken('InvalidFormat token')
      expect(extracted).toBeNull()
    })

    it('should return null for missing token', () => {
      const extracted = extractToken('Bearer ')
      expect(extracted).toBeNull()
    })

    it('should return null for undefined header', () => {
      const extracted = extractToken(undefined)
      expect(extracted).toBeNull()
    })
  })

  describe('User Sanitization', () => {
    it('should remove sensitive fields from user object', () => {
      const user = {
        userId: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        username: 'testuser',
        role: 'user',
        isActive: true,
        lastLogin: new Date()
      }

      const sanitized = sanitizeUser(user)

      expect(sanitized.userId).toBe(user.userId)
      expect(sanitized.email).toBe(user.email)
      expect(sanitized.username).toBe(user.username)
      expect(sanitized.password).toBeUndefined()
    })

    it('should handle user without password field', () => {
      const user = {
        userId: 1,
        email: 'test@example.com',
        username: 'testuser'
      }

      const sanitized = sanitizeUser(user)

      expect(sanitized.userId).toBe(user.userId)
      expect(sanitized.email).toBe(user.email)
    })
  })
})

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with message and status', () => {
      const error = new AppError('Test error', 400)

      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AppError')
      expect(error.isOperational).toBe(true)
    })

    it('should default to 500 status code', () => {
      const error = new AppError('Test error')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Invalid credentials')

      expect(error.message).toBe('Invalid credentials')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('AuthenticationError')
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Validation failed')

      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ValidationError')
    })
  })
})
