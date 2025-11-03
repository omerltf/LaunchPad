import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import { setTokenExpiredCallback } from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (err) {
          console.error('Failed to fetch user:', err)
          authService.clearTokens()
        }
      }
      setLoading(false)
    }

    initAuth()

    // Register callback for token expiration
    const handleTokenExpired = () => {
      setUser(null)
      setError('Your session has expired. Please log in again.')
    }

    // Store the callback ID to ensure proper cleanup
    const callbackId = setTokenExpiredCallback(handleTokenExpired)
    
    // Cleanup: remove callback only if it's still ours
    return () => setTokenExpiredCallback(null, callbackId)
  }, [])

  // Helper to extract error message
  const extractErrorMessage = (err, fallback) => {
    return err?.response?.data?.message || err?.message || fallback
  }

  const register = async (userData) => {
    try {
      setError(null)
      setLoading(true)
      const response = await authService.register(userData)
      setUser(response.user)
      return response
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Registration failed')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      setLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
      return response
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Login failed')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Clear user even if logout fails
      setUser(null)
      authService.clearTokens()
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
