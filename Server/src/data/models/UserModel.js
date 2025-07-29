/**
 * @fileoverview User Model
 * @description User data model definition
 * @author LaunchPad Template
 * @version 1.0.0
 */

/**
 * User model schema definition
 * This is a template that can be adapted for different database types
 */
const UserModel = {
  // Schema definition (adapter-specific implementation)
  schema: {
    id: {
      type: 'integer',
      primary: true,
      autoIncrement: true
    },
    username: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 50
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 255
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    },
    firstName: {
      type: 'string',
      maxLength: 50
    },
    lastName: {
      type: 'string',
      maxLength: 50
    },
    role: {
      type: 'string',
      default: 'user',
      enum: ['admin', 'user', 'moderator']
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    lastLoginAt: {
      type: 'datetime',
      nullable: true
    },
    createdAt: {
      type: 'datetime',
      required: true
    },
    updatedAt: {
      type: 'datetime',
      required: true
    },
    deactivatedAt: {
      type: 'datetime',
      nullable: true
    },
    activatedAt: {
      type: 'datetime',
      nullable: true
    }
  },

  // Validation rules
  validation: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6
    },
    role: {
      enum: ['admin', 'user', 'moderator']
    }
  },

  // Model methods
  methods: {
    /**
     * Validate user data
     * @param {Object} userData - User data to validate
     * @returns {Object} Validation result
     */
    validate (userData) {
      const errors = []

      // Username validation
      if (!userData.username) {
        errors.push('Username is required')
      } else if (userData.username.length < 3) {
        errors.push('Username must be at least 3 characters')
      } else if (userData.username.length > 50) {
        errors.push('Username must be less than 50 characters')
      } else if (!this.validation.username.pattern.test(userData.username)) {
        errors.push('Username can only contain letters, numbers, and underscores')
      }

      // Email validation
      if (!userData.email) {
        errors.push('Email is required')
      } else if (!this.validation.email.pattern.test(userData.email)) {
        errors.push('Email format is invalid')
      }

      // Password validation
      if (!userData.password) {
        errors.push('Password is required')
      } else if (userData.password.length < 6) {
        errors.push('Password must be at least 6 characters')
      }

      // Role validation
      if (userData.role && !this.validation.role.enum.includes(userData.role)) {
        errors.push('Invalid role specified')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    },

    /**
     * Sanitize user data for public display
     * @param {Object} userData - User data
     * @returns {Object} Sanitized user data
     */
    sanitize (userData) {
      const { password, ...sanitizedData } = userData
      return sanitizedData
    },

    /**
     * Prepare user data for creation
     * @param {Object} userData - Raw user data
     * @returns {Object} Prepared user data
     */
    prepareForCreation (userData) {
      return {
        ...userData,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }
}

module.exports = UserModel
