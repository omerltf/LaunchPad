import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:3001'

function App() {
  const [users, setUsers] = useState([])
  const [serverInfo, setServerInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '' })

  // Fetch server info on component mount
  useEffect(() => {
    fetchServerInfo()
    fetchUsers()
  }, [])

  const fetchServerInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`)
      setServerInfo(response.data)
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Server connection error:', err)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`)
      setUsers(response.data.users || [])
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, newUser)
      if (response.data.user) {
        setUsers(prev => [...prev, response.data.user])
        setNewUser({ name: '', email: '' })
      }
    } catch (err) {
      setError('Failed to create user')
      console.error('Create user error:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      alert(`Server Health: ${response.data.status}\nUptime: ${Math.floor(response.data.uptime)}s`)
    } catch (err) {
      alert(`Failed to check server health: ${err.message}`)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Client Dashboard</h1>
          <p>React + Vite frontend for Node.js API</p>
        </header>

        {/* Server Status */}
        <div className="card">
          <h2>Server Status</h2>
          {serverInfo ? (
            <div className="status-grid">
              <div className="status-item status-success">
                <h3>Status</h3>
                <p>{serverInfo.message}</p>
              </div>
              <div className="status-item status-info">
                <h3>Environment</h3>
                <p>{serverInfo.environment}</p>
              </div>
              <div className="status-item status-secondary">
                <h3>Last Updated</h3>
                <p>{new Date(serverInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="status-item status-error">
              <p>Unable to connect to server</p>
            </div>
          )}
          <button onClick={checkHealth} className="btn btn-primary">
            Check Health
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Add User Form */}
        <div className="card">
          <h2>Add New User</h2>
          <form onSubmit={createUser} className="user-form">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="users-header">
            <h2>Users ({users.length})</h2>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && users.length === 0 ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              No users found. Add some users to get started!
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <small>ID: {user.id}</small>
                  {user.createdAt && (
                    <small>Created: {new Date(user.createdAt).toLocaleDateString()}</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
