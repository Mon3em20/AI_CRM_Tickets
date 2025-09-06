import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
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
          <h1>Customer Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back, {user?.name}!</h2>
          <p>Manage your support tickets and get help.</p>
        </div>

        <div className="dashboard-grid">
          {/* User Information Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Account Information</h3>
            </div>
            <div className="card-content">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{user?.name}</h4>
                  <p className="user-email">{user?.email}</p>
                  <span className="user-role customer-role">
                    CUSTOMER
                  </span>
                </div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Member Since:</label>
                  <span>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>User ID:</label>
                  <span className="user-id">{user?.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Actions Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Support Actions</h3>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                <button className="action-button primary">
                  Create New Ticket
                </button>
                <button className="action-button secondary">
                  View My Tickets
                </button>
                <button className="action-button secondary">
                  Browse Knowledge Base
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Summary Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>My Tickets</h3>
            </div>
            <div className="card-content">
              <div className="ticket-stats">
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Open</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
