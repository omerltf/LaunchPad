/**
 * @fileoverview Authentication Service
 * @description Handles all authentication-related API calls
 * @author LaunchPad Template
 * @version 1.0.0
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_VERSION = '/api/v1'

/**
 * Authentication service for user registration, login, logout, etc.
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} [userData.username] - Username (optional)
   * @param {string} [userData.firstName] - First name (optional)
   * @param {string} [userData.lastName] - Last name (optional)
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_VERSION}/auth/register`,
        userData
      )
      
      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data
        
        // Store tokens
        this.setTokens(accessToken, refreshToken)
        
        return { user, accessToken, refreshToken }
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  async login(credentials) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_VERSION}/auth/login`,
        credentials
      )
      
      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data
        
        // Store tokens
        this.setTokens(accessToken, refreshToken)
        
        return { user, accessToken, refreshToken }
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const accessToken = this.getAccessToken()
      
      if (accessToken) {
        await axios.post(
          `${API_BASE_URL}${API_VERSION}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        )
      }
    } catch (error) {
      // Log but don't throw - we still want to clear local tokens
      console.error('Logout error:', error)
    } finally {
      // Always clear local tokens
      this.clearTokens()
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(
        `${API_BASE_URL}${API_VERSION}/auth/refresh`,
        { refreshToken }
      )
      
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        
        // Update stored tokens
        this.setTokens(accessToken, newRefreshToken)
        
        return { accessToken, refreshToken: newRefreshToken }
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      // If refresh fails, clear tokens and force re-login
      this.clearTokens()
      throw this.handleError(error)
    }
  }

  /**
   * Get current user info
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const accessToken = this.getAccessToken()
      
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.get(
        `${API_BASE_URL}${API_VERSION}/auth/me`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      
      if (response.data.success && response.data.data) {
        return response.data.data.user
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const accessToken = this.getAccessToken()
      
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await axios.post(
        `${API_BASE_URL}${API_VERSION}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Store tokens in localStorage
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @warning Storing tokens in localStorage exposes them to XSS attacks.
   *          For production environments, consider using httpOnly cookies
   *          to store authentication tokens securely.
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  /**
   * Get access token from localStorage
   * @returns {string|null} Access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken')
  }

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Clear all tokens from localStorage
   */
  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if access token exists and is not expired
   */
  isAuthenticated() {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      // Decode JWT (header.payload.signature)
      const payload = JSON.parse(atob(token.split('.')[1]))
      // Check if token is expired (exp is in seconds)
      if (payload.exp && Date.now() / 1000 < payload.exp) {
        return true
      }
      return false
    } catch {
      // Invalid token format
      return false
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 
                     error.response.data?.error ||
                     'An error occurred'
      const statusCode = error.response.status
      
      const err = new Error(message)
      err.statusCode = statusCode
      err.response = error.response.data
      return err
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.')
    } else {
      // Other errors
      return error
    }
  }
}

// Export singleton instance
export default new AuthService()
