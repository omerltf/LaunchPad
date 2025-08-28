import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

function App() {
  const [users, setUsers] = useState([])
  const [serverInfo, setServerInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)

  // Fetch server info on component mount
  useEffect(() => {
    fetchServerInfo()
    fetchUsers()
    fetchMaintenanceMode()
  }, [])

  const fetchMaintenanceMode = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance`)
      setMaintenanceMode(response.data.maintenanceMode)
    } catch (err) {
      console.error('Failed to fetch maintenance mode:', err)
    }
  }

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

  const toggleMaintenanceMode = async () => {
    setMaintenanceLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance/toggle`)
      setMaintenanceMode(response.data.maintenanceMode)
      
      // Show success message
      const message = response.data.maintenanceMode 
        ? 'Application switched to maintenance mode' 
        : 'Application switched to live mode'
      alert(message)
    } catch (err) {
      setError('Failed to toggle maintenance mode')
      console.error('Toggle maintenance mode error:', err)
    } finally {
      setMaintenanceLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-6">
      {/* Maintenance Mode Overlay */}
      {maintenanceMode && (
        <div className="fixed inset-0 bg-orange-500 bg-opacity-20 backdrop-blur-sm z-10 pointer-events-none">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg pointer-events-auto">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔧</span>
              <span className="font-semibold">Maintenance Mode Active</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">LaunchPad</h1>
          <p className="text-lg opacity-90">Full-Stack Template • React + Vite + Node.js + Tailwind</p>
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

        {/* Maintenance Mode Control */}
        <div className="card">
          <h2 className="card-header">Maintenance Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className={`status-card ${maintenanceMode ? 'status-warning' : 'status-success'}`}>
              <h3 className="status-title">Current Mode</h3>
              <p className="font-bold text-lg">
                {maintenanceMode ? '🔧 Maintenance Mode' : '🟢 Live Mode'}
              </p>
              <p className="text-sm mt-2 opacity-80">
                {maintenanceMode 
                  ? 'Application is currently under maintenance' 
                  : 'Application is running normally'
                }
              </p>
            </div>
            <div className="text-center">
              <button 
                onClick={toggleMaintenanceMode}
                disabled={maintenanceLoading}
                className={`btn ${maintenanceMode ? 'btn-live' : 'btn-maintenance'}`}
              >
                {maintenanceLoading 
                  ? 'Switching...' 
                  : maintenanceMode 
                    ? '🟢 Switch to Live Mode' 
                    : '🔧 Switch to Maintenance Mode'
                }
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Click to toggle between maintenance and live mode
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Add User Form */}
        <div className={`card ${maintenanceMode ? 'opacity-60' : ''}`}>
          <h2 className="card-header">Add New User</h2>
          {maintenanceMode && (
            <div className="bg-orange-100 text-orange-800 p-3 rounded-lg mb-4 text-center">
              ⚠️ User creation is disabled during maintenance mode
            </div>
          )}
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading || maintenanceMode}
              className="form-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading || maintenanceMode}
              className="form-input"
            />
            <button
              type="submit"
              disabled={loading || maintenanceMode}
              className="btn btn-success"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className={`card ${maintenanceMode ? 'opacity-60' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="card-header mb-0">Users ({users.length})</h2>
            <button
              onClick={fetchUsers}
              disabled={loading || maintenanceMode}
              className="btn btn-secondary"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {maintenanceMode && (
            <div className="bg-orange-100 text-orange-800 p-3 rounded-lg mb-4 text-center">
              ⚠️ User data refresh is disabled during maintenance mode
            </div>
          )}

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
