import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Layout/Navbar';
import Sidebar from '../../components/Layout/Sidebar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    priority: ''
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (filterParams = {}) => {
    try {
      setLoading(true);
      const data = await getAnalytics(filterParams);
      setAnalytics(data);
      setError(null);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) activeFilters[key] = filters[key];
    });
    loadAnalytics(activeFilters);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      priority: ''
    });
    loadAnalytics();
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-overlay">
          <div className="creative-loader">
            <div className="loader-animation">
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
            </div>
            <div className="loader-text">Loading Admin Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="dashboard-header">
              <h1>🛠️ Admin Dashboard</h1>
              <div className="error-message">⚠️ Error: {error}</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2>🚀 Welcome Back, Admin!</h2>
            <p>Master control center for your CRM system - {user?.name}</p>
          </div>

          {/* Enhanced Header */}
          <div className="dashboard-header">
            <h1>📊 System Analytics Dashboard</h1>
            <p>Real-time insights and comprehensive system overview</p>
          </div>

          {/* Enhanced Filters */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🔍 Advanced Filters</h3>
            </div>
            <div className="analytics-filters">
              <div className="filter-group">
                <label className="filter-label">📅 Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">📅 End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">🏷️ Category:</label>
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  placeholder="e.g., technical, billing"
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">⚡ Priority:</label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All Priorities</option>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="filter-actions">
                <button onClick={applyFilters} className="btn btn-primary">
                  ✨ Apply Filters
                </button>
                <button onClick={clearFilters} className="btn btn-secondary">
                  🔄 Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>📈 Key Performance Metrics</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-card gentle-float">
                <div className="stat-icon">🎫</div>
                <h3>Total Tickets</h3>
                <div className="metric-number">{analytics?.totalTickets || 0}</div>
                <div className="metric-label">All time tickets</div>
              </div>
              
              <div className="metric-card gentle-float">
                <div className="stat-icon">⏱️</div>
                <h3>SLA Compliance</h3>
                <div className="metric-number">{analytics?.slaComplianceRate || 0}%</div>
                <div className="metric-label">Within SLA targets</div>
              </div>
              
              <div className="metric-card gentle-float">
                <div className="stat-icon">🤖</div>
                <h3>AI Accuracy</h3>
                <div className="metric-number">{analytics?.aiAccuracy || 0}%</div>
                <div className="metric-label">AI response accuracy</div>
              </div>
              
              <div className="metric-card gentle-float">
                <div className="stat-icon">✅</div>
                <h3>Resolution Rate</h3>
                <div className="metric-number">{analytics?.resolutionRate || 0}%</div>
                <div className="metric-label">Successfully resolved</div>
              </div>

              <div className="metric-card gentle-float">
                <div className="stat-icon">📋</div>
                <h3>Open Backlog</h3>
                <div className="metric-number">{analytics?.backlogCount || 0}</div>
                <div className="metric-label">Pending tickets</div>
              </div>

              <div className="metric-card gentle-float">
                <div className="stat-icon">⚡</div>
                <h3>Avg Resolution</h3>
                <div className="metric-number">{analytics?.avgResolutionTimeHours || 0}h</div>
                <div className="metric-label">Average time</div>
              </div>

              <div className="metric-card gentle-float">
                <div className="stat-icon">⚠️</div>
                <h3>SLA Breaches</h3>
                <div className="metric-number">{analytics?.slaBreachCount || 0}</div>
                <div className="metric-label">Policy violations</div>
              </div>

              <div className="metric-card gentle-float">
                <div className="stat-icon">🔄</div>
                <h3>Auto-Response</h3>
                <div className="metric-number">{analytics?.autoResponseRate || 0}%</div>
                <div className="metric-label">AI automation rate</div>
              </div>
            </div>
          </div>

          {/* Enhanced Status Overview */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>📊 System Status Overview</h3>
            </div>
            <div className="status-grid">
              <div className="status-card">
                <div className="status-indicator active"></div>
                <h4>🎯 Total Volume</h4>
                <div className="status-number">{analytics?.totalTickets || 0}</div>
                <div className="status-label">Tickets processed</div>
              </div>
              <div className="status-card">
                <div className="status-indicator active"></div>
                <h4>✅ Resolved</h4>
                <div className="status-number">{analytics?.resolvedTickets || 0}</div>
                <div className="status-label">Successfully closed</div>
              </div>
              <div className="status-card">
                <div className="status-indicator active"></div>
                <h4>🎯 Success Rate</h4>
                <div className="status-number">{analytics?.resolutionRate || 0}%</div>
                <div className="status-label">Overall performance</div>
              </div>
            </div>
          </div>

          {/* Enhanced Applied Filters */}
          {(filters.startDate || filters.endDate || filters.category || filters.priority) && (
            <div className="dashboard-section">
              <div className="card-header">
                <h3>🎯 Active Filters</h3>
              </div>
              <div className="applied-filters">
                {filters.startDate && (
                  <span className="filter-tag">
                    📅 Start: {filters.startDate}
                  </span>
                )}
                {filters.endDate && (
                  <span className="filter-tag">
                    📅 End: {filters.endDate}
                  </span>
                )}
                {filters.category && (
                  <span className="filter-tag">
                    🏷️ Category: {filters.category}
                  </span>
                )}
                {filters.priority && (
                  <span className="filter-tag">
                    ⚡ Priority: {filters.priority}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Data Information */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>📊 System Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>🕒 Last Updated:</label>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>📊 Data Range:</label>
                <span>
                  {analytics?.dateRange?.startDate || 'All time'} → {analytics?.dateRange?.endDate || 'Present'}
                </span>
              </div>
              <div className="info-item">
                <label>🎯 System Status:</label>
                <span className="status-indicator active">🟢 Online & Operational</span>
              </div>
              <div className="info-item">
                <label>👤 Active User:</label>
                <span>{user?.name} ({user?.role})</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;