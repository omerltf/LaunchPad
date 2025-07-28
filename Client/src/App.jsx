import { useState, useEffect } from 'react'
import axios from 'axios'

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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Client Dashboard</h1>
          <p className="text-lg opacity-90">React + Vite frontend for Node.js API</p>
        </header>

        {/* Server Status */}
        <div className="card">
          <h2 className="card-header">Server Status</h2>
          {serverInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="status-card status-success">
                <h3 className="status-title">Status</h3>
                <p className="font-bold">{serverInfo.message}</p>
              </div>
              <div className="status-card status-info">
                <h3 className="status-title">Environment</h3>
                <p className="font-bold">{serverInfo.environment}</p>
              </div>
              <div className="status-card status-warning">
                <h3 className="status-title">Last Updated</h3>
                <p className="font-bold">{new Date(serverInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="status-card status-error mb-4">
              <p className="font-bold">Unable to connect to server</p>
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
          <h2 className="card-header">Add New User</h2>
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              className="form-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading}
              className="form-input"
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="card-header mb-0">Users ({users.length})</h2>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && users.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="spinner mx-auto mb-4"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-600 italic">
              No users found. Add some users to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{user.name}</h3>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <small className="block text-gray-500 text-sm mb-1">ID: {user.id}</small>
                  {user.createdAt && (
                    <small className="block text-gray-500 text-sm">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </small>
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
