/**
 * @fileoverview Authentication routes (v1)
 * @description Routes for user authentication (register, login, logout, refresh token)
 * @author LaunchPad Template
 * @version 1.0.0
 */

const express = require('express')
const { body } = require('express-validator')
const { asyncHandler, sendSuccess } = require('../../utils/helpers')
const { rateLimit, handleValidationErrors } = require('../../middleware')
const { authenticate, verifyRefreshToken } = require('../../middleware/auth')
const AuthService = require('../../services/AuthService')

const router = express.Router()
const authService = new AuthService()

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 registrations per 15 minutes per IP
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('First name must not exceed 50 characters'),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Last name must not exceed 50 characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body)

    sendSuccess(res, {
      message: 'User registered successfully',
      ...result
    }, 201)
  })
)

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }), // 10 login attempts per 15 minutes per IP
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body)

    sendSuccess(res, {
      message: 'Login successful',
      ...result
    })
  })
)

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post(
  '/refresh',
  rateLimit({ max: 20, windowMs: 15 * 60 * 1000 }), // 20 token refresh attempts per 15 minutes per IP
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  handleValidationErrors,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(req.userId, req.body.refreshToken)

    sendSuccess(res, {
      message: 'Token refreshed successfully',
      ...result
    })
  })
)

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    await authService.logout(req.user.userId)

    sendSuccess(res, {
      message: 'Logged out successfully'
    })
  })
)

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 password change attempts per 15 minutes per IP
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    await authService.changePassword(req.user.userId, currentPassword, newPassword)

    sendSuccess(res, {
      message: 'Password changed successfully'
    })
  })
)

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    // Simply return the authenticated user info from JWT
    sendSuccess(res, {
      user: req.user
    })
  })
)

module.exports = router
