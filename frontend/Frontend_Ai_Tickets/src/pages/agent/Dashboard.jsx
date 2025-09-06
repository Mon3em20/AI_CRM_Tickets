import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
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
          <h1>Agent Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back, Agent {user?.name}!</h2>
          <p>Manage customer tickets and provide support.</p>
        </div>

        <div className="dashboard-grid">
          {/* User Information Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Agent Information</h3>
            </div>
            <div className="card-content">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{user?.name}</h4>
                  <p className="user-email">{user?.email}</p>
                  <span className="user-role agent-role">
                    AGENT
                  </span>
                </div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Agent Since:</label>
                  <span>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Agent ID:</label>
                  <span className="user-id">{user?.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Actions Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Agent Actions</h3>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                <button className="action-button primary">
                  View Assigned Tickets
                </button>
                <button className="action-button secondary">
                  Update Ticket Status
                </button>
                <button className="action-button secondary">
                  Knowledge Base
                </button>
              </div>
            </div>
          </div>

          {/* Workload Summary Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>My Workload</h3>
            </div>
            <div className="card-content">
              <div className="ticket-stats">
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Assigned</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Completed Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Performance</h3>
            </div>
            <div className="card-content">
              <div className="performance-stats">
                <div className="performance-item">
                  <label>Average Resolution Time:</label>
                  <span>N/A</span>
                </div>
                <div className="performance-item">
                  <label>Customer Satisfaction:</label>
                  <span>N/A</span>
                </div>
                <div className="performance-item">
                  <label>Tickets Resolved:</label>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
