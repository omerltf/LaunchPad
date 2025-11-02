/**
 * @fileoverview User routes (v1)
 * @description Routes for user management and profile operations
 * @author LaunchPad Template
 * @version 1.0.0
 */

const express = require('express')
const { body, query, param } = require('express-validator')
const { asyncHandler, sendSuccess } = require('../../utils/helpers')
const { handleValidationErrors } = require('../../middleware')
const { authenticate, authorize, checkOwnership } = require('../../middleware/auth')
const UserService = require('../../services/UserService')

const router = express.Router()
const userService = new UserService()

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.userId)

    sendSuccess(res, {
      user
    })
  })
)

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
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
    const updatedUser = await userService.updateProfile(req.user.userId, req.body)

    sendSuccess(res, {
      message: 'Profile updated successfully',
      user: updatedUser
    })
  })
)

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('role')
      .optional()
      .isIn(['user', 'moderator', 'admin'])
      .withMessage('Invalid role'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query)

    sendSuccess(res, result)
  })
)

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users by email or username
 * @access  Private (Admin or Moderator)
 */
router.get(
  '/search',
  authenticate,
  authorize('admin', 'moderator'),
  [
    query('q')
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const users = await userService.searchUsers(req.query.q)

    sendSuccess(res, {
      users,
      count: users.length
    })
  })
)

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  checkOwnership('id'),
  asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id)

    sendSuccess(res, {
      user
    })
  })
)

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile (owner or admin)
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID'),
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
  checkOwnership('id'),
  asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.params.id, req.body)

    sendSuccess(res, {
      message: 'User updated successfully',
      user: updatedUser
    })
  })
)

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/role',
  authenticate,
  authorize('admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID'),
    body('role')
      .isIn(['user', 'moderator', 'admin'])
      .withMessage('Invalid role')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserRole(req.params.id, req.body.role)

    sendSuccess(res, {
      message: 'User role updated successfully',
      user: updatedUser
    })
  })
)

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Deactivate user (admin or self)
 * @access  Private (Admin or Owner)
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const deactivatedUser = await userService.deactivateUser(
      req.params.id,
      req.user.userId,
      req.user.role
    )

    sendSuccess(res, {
      message: 'User deactivated successfully',
      user: deactivatedUser
    })
  })
)

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activate user (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/activate',
  authenticate,
  authorize('admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const activatedUser = await userService.activateUser(req.params.id)

    sendSuccess(res, {
      message: 'User activated successfully',
      user: activatedUser
    })
  })
)

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id, req.user.userId)

    sendSuccess(res, {
      message: 'User deleted successfully'
    })
  })
)

module.exports = router
