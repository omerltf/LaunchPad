/**
 * @fileoverview Axios Instance Configuration
 * @description Configures axios with automatic token injection and refresh
 * @author LaunchPad Template
 * @version 1.0.0
 */

import axios from 'axios'
import authService from './authService'

export const AUTH_TOKEN_EXPIRED = 'auth:tokenExpired'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false
let failedQueue = []

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If currently refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }

    // Mark request as retried
    originalRequest._retry = true
    isRefreshing = true

    try {
      // Attempt to refresh the token
      const { accessToken } = await authService.refreshAccessToken()
      
      // Update the failed request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      
      // Process queued requests with new token
      processQueue(null, accessToken)
      
      isRefreshing = false
      
      // Retry the original request
      return apiClient(originalRequest)
    } catch (refreshError) {
      // Refresh failed - clear tokens and reject all queued requests
      processQueue(refreshError, null)
      isRefreshing = false
      
      // Clear tokens and redirect to login (handled by AuthContext)
      authService.clearTokens()
      
      // Emit custom event that AuthContext can listen to
      window.dispatchEvent(new Event(AUTH_TOKEN_EXPIRED))
      
      return Promise.reject(refreshError)
    }
  }
)

export default apiClient
