import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome, {user?.firstName || user?.username || user?.email}! 👋
                </h1>
                <p className="text-gray-600">Your personal dashboard</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Information</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>

              {user?.username && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-lg text-gray-900">{user.username}</p>
                </div>
              )}

              {(user?.firstName || user?.lastName) && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg text-gray-900">
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided'}
                  </p>
                </div>
              )}

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : user?.role === 'moderator'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role || 'user'}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-sm text-gray-600 font-mono">{user?.id}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Account Status</h3>
              <p className="text-sm text-gray-600">
                Your account is active and secure.
              </p>
              <div className="mt-4">
                <Link to="/change-password" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Change Password →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Quick Stats</h3>
              <p className="text-sm text-gray-600">
                Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Admin Panel Link */}
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <div className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">🛡️ Admin Access</h3>
              <p className="mb-4">You have elevated privileges on this platform.</p>
              <button 
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors font-medium"
              >
                Go to Admin Panel
              </button>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
