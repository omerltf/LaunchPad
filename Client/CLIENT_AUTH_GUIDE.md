# Client-Side JWT Authentication Implementation Guide

## 📋 Overview

This guide explains how to integrate JWT authentication into the React client to work with the server's authentication system.

---

## ✅ What Has Been Added

### 1. **Authentication Service** (`src/services/authService.js`)

Complete service for authentication API calls:

- ✅ `register()` - Register new user
- ✅ `login()` - Login user
- ✅ `logout()` - Logout and clear tokens
- ✅ `refreshAccessToken()` - Refresh expired access token
- ✅ `getCurrentUser()` - Get current user info
- ✅ `changePassword()` - Change user password
- ✅ Token storage management (localStorage)
- ✅ Error handling

### 2. **API Client** (`src/services/apiClient.js`)

Configured axios instance with:

- ✅ Automatic token injection in request headers
- ✅ Automatic token refresh on 401 errors
- ✅ Request queuing during token refresh
- ✅ Token expiration event handling

### 3. **Authentication Context** (`src/hooks/useAuth.jsx`)

Global authentication state management:

- ✅ `useAuth()` hook for components
- ✅ `AuthProvider` wrapper component
- ✅ User state management
- ✅ Loading and error states
- ✅ Login/logout/register functions

### 4. **Protected Route Component** (`src/utils/ProtectedRoute.jsx`)

Route guard for authenticated pages:

- ✅ Redirects unauthenticated users to login
- ✅ Shows loading state while checking auth
- ✅ Configurable redirect path

---

## 🚀 Required Setup Steps

### Step 1: Install React Router (if not installed)

```bash
npm install react-router-dom
```

### Step 2: Create Environment Variable

Create or update `.env` file in Client root:

```bash
# API Base URL
VITE_API_URL=http://localhost:3001
```

### Step 3: Wrap App with AuthProvider

Update `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

### Step 4: Update API Calls to Use apiClient

Replace direct axios calls with the configured `apiClient`:

**Before:**

```javascript
import axios from 'axios'
const response = await axios.get('http://localhost:3001/api/users')
```

**After:**

```javascript
import apiClient from './services/apiClient'
const response = await apiClient.get('/api/v1/users/profile')
```

---

## 📝 Usage Examples

### 1. Login Component Example

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await login({ email, password })
      navigate('/dashboard') // Redirect after successful login
    } catch (err) {
      // Error is handled by context and available in error state
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
```

### 2. Register Component Example

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: ''
  })
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Password * (min 8 characters)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            minLength="8"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
```

### 3. Protected Dashboard Example

```jsx
import { useAuth } from './hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}!</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Username:</strong> {user?.username || 'Not set'}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>First Name:</strong> {user?.firstName || 'Not set'}</p>
          <p><strong>Last Name:</strong> {user?.lastName || 'Not set'}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
```

### 4. App Router Configuration Example

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './utils/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import HomePage from './pages/HomePage'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
```

### 5. Making Authenticated API Calls

```jsx
import { useState, useEffect } from 'react'
import apiClient from '../services/apiClient'

function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // apiClient automatically adds Authorization header
        const response = await apiClient.get('/api/v1/users')
        
        if (response.data.success) {
          setUsers(response.data.data.users)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  )
}

export default UsersList
```

---

## 🔐 Security Best Practices

### 1. Token Storage

**Current Implementation:**

- Tokens stored in `localStorage`
- ✅ Survives page refreshes
- ⚠️ Vulnerable to XSS attacks

**For Production:**
Consider using `httpOnly` cookies for enhanced security:

- Requires server to set cookies
- Not accessible to JavaScript
- Protected from XSS attacks

### 2. Token Refresh Strategy

The `apiClient` automatically:

- ✅ Refreshes expired access tokens
- ✅ Queues failed requests during refresh
- ✅ Retries failed requests with new token
- ✅ Clears tokens if refresh fails

### 3. Secure Communication

**Always use HTTPS in production:**

```javascript
// .env.production
VITE_API_URL=https://api.yourdomain.com
```

### 4. Error Handling

The auth system handles:

- ✅ Network errors
- ✅ Invalid credentials
- ✅ Token expiration
- ✅ Server errors

---

## 🎯 Migration Checklist

If you have existing API calls, migrate them:

- [ ] Replace `axios` imports with `apiClient`
- [ ] Update base URL to use `VITE_API_URL`
- [ ] Remove manual Authorization header setting
- [ ] Update API endpoints to v1 format (`/api/v1/...`)
- [ ] Add error handling for 401 responses
- [ ] Wrap protected pages with `ProtectedRoute`
- [ ] Add login/register pages
- [ ] Update navigation to show/hide based on auth state

---

## 📚 Additional Files Needed

You'll likely want to create:

1. **Login Page** (`src/pages/LoginPage.jsx`) - See example above
2. **Register Page** (`src/pages/RegisterPage.jsx`) - See example above
3. **Dashboard** (`src/pages/Dashboard.jsx`) - Protected page example
4. **Navigation Component** - Shows login/logout based on auth state
5. **Profile Page** - User profile management
6. **Change Password Page** - Password change form

---

## 🐛 Troubleshooting

### Problem: 401 Unauthorized on API calls

**Solution:** Check that tokens are being stored and sent correctly

```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

### Problem: Infinite refresh loop

**Solution:** Check token expiry times and refresh logic

- Access token: 15 minutes
- Refresh token: 7 days
- Tokens automatically refresh before expiry

### Problem: CORS errors

**Solution:** Ensure server CORS is configured for your client URL

```javascript
// Server .env
CORS_ORIGIN=http://localhost:3000
```

### Problem: Tokens not persisting

**Solution:** Check localStorage is enabled and not blocked

```javascript
// Test localStorage
try {
  localStorage.setItem('test', 'value')
  localStorage.removeItem('test')
  console.log('localStorage works!')
} catch (e) {
  console.error('localStorage blocked:', e)
}
```

---

## 🚀 Next Steps

1. ✅ Create login and register pages
2. ✅ Update navigation to show auth state
3. ✅ Wrap protected routes with `ProtectedRoute`
4. ✅ Replace direct axios calls with `apiClient`
5. ✅ Test token refresh flow
6. ✅ Add error handling UI
7. ✅ Implement password change feature
8. ✅ Add loading states
9. ✅ Test logout flow
10. ✅ Production security review

---

## 📖 Related Documentation

- Server: `SECURITY.md` - Server-side security documentation
- Server: `docs/SECURITY_BEST_PRACTICES.md` - Security guidelines
- React Router: <https://reactrouter.com/>
- Axios: <https://axios-http.com/>

---

**Last Updated**: 2025-11-02  
**Version**: 1.0.0
