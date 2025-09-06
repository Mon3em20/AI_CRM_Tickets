import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back, Admin {user?.name}!</h2>
          <p>System administration and management overview.</p>
        </div>

        <div className="dashboard-grid">
          {/* Admin Information Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Admin Information</h3>
            </div>
            <div className="card-content">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{user?.name}</h4>
                  <p className="user-email">{user?.email}</p>
                  <span className="user-role admin-role">
                    ADMIN
                  </span>
                </div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Admin Since:</label>
                  <span>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Admin ID:</label>
                  <span className="user-id">{user?.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>System Management</h3>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                <button className="action-button primary">
                  Manage Users
                </button>
                <button className="action-button secondary">
                  System Settings
                </button>
                <button className="action-button secondary">
                  View Reports
                </button>
                <button className="action-button secondary">
                  SLA Configuration
                </button>
              </div>
            </div>
          </div>

          {/* System Overview Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>System Overview</h3>
            </div>
            <div className="card-content">
              <div className="system-stats">
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Active Tickets</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Agents Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>System Status</h3>
            </div>
            <div className="card-content">
              <div className="status-items">
                <div className="status-item">
                  <div className="status-indicator active"></div>
                  <span>Authentication Service</span>
                </div>
                <div className="status-item">
                  <div className="status-indicator active"></div>
                  <span>Database Connection</span>
                </div>
                <div className="status-item">
                  <div className="status-indicator active"></div>
                  <span>API Services</span>
                </div>
                <div className="status-item">
                  <div className="status-indicator active"></div>
                  <span>AI Service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Performance Metrics</h3>
            </div>
            <div className="card-content">
              <div className="performance-metrics">
                <div className="metric-item">
                  <label>Average Response Time:</label>
                  <span>N/A</span>
                </div>
                <div className="metric-item">
                  <label>System Uptime:</label>
                  <span>99.9%</span>
                </div>
                <div className="metric-item">
                  <label>Customer Satisfaction:</label>
                  <span>N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
