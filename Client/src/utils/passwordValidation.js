/**
 * @fileoverview Password validation constants and utilities
 * @description Shared password validation rules that mirror server-side validation
 * to ensure consistency between client and server
 * @author LaunchPad Template
 * @version 1.0.0
 */

/**
 * Password validation constants
 * These rules MUST match the server-side validation in Server/src/utils/auth.js
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_LOWERCASE: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true
}

/**
 * Regular expressions for password validation
 * IMPORTANT: Keep this in sync with server-side validation
 * Server regex: /[!@#$%^&*(),.?":{}|<>-]/
 */
export const PASSWORD_REGEX = {
  LOWERCASE: /[a-z]/,
  UPPERCASE: /[A-Z]/,
  NUMBER: /[0-9]/,
  // Special characters allowed (matches server-side validation)
  SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>-]/
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    }
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`
    }
  }

  if (password.length > PASSWORD_RULES.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Password must not exceed ${PASSWORD_RULES.MAX_LENGTH} characters`
    }
  }

  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !PASSWORD_REGEX.LOWERCASE.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    }
  }

  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !PASSWORD_REGEX.UPPERCASE.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    }
  }

  if (PASSWORD_RULES.REQUIRE_NUMBER && !PASSWORD_REGEX.NUMBER.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    }
  }

  if (PASSWORD_RULES.REQUIRE_SPECIAL_CHAR && !PASSWORD_REGEX.SPECIAL_CHAR.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character'
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Get password requirements as a human-readable string
 * @returns {string} Password requirements description
 */
export const getPasswordRequirements = () => {
  const requirements = []
  
  requirements.push(`at least ${PASSWORD_RULES.MIN_LENGTH} characters`)
  
  if (PASSWORD_RULES.REQUIRE_UPPERCASE) {
    requirements.push('uppercase')
  }
  
  if (PASSWORD_RULES.REQUIRE_LOWERCASE) {
    requirements.push('lowercase')
  }
  
  if (PASSWORD_RULES.REQUIRE_NUMBER) {
    requirements.push('number')
  }
  
  if (PASSWORD_RULES.REQUIRE_SPECIAL_CHAR) {
    requirements.push('special character')
  }
  
  return `Must be ${requirements.join(', ')}`
}
