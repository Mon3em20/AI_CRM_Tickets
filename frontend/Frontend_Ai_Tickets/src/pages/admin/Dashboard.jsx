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
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="dashboard-header">
              <h1>Admin Dashboard</h1>
              <div className="error-message">Error: {error}</div>
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
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name}! Here's your system overview.</p>
          </div>

          {/* Filters */}
          <div className="analytics-filters">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="e.g., technical, billing"
              />
            </div>
            <div className="filter-group">
              <label>Priority:</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="filter-actions">
              <button onClick={applyFilters} className="btn-primary">Apply Filters</button>
              <button onClick={clearFilters} className="btn-secondary">Clear</button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Tickets</h3>
              <div className="metric-number">{analytics?.totalTickets || 0}</div>
              <div className="metric-label">All tickets</div>
            </div>
            
            <div className="metric-card">
              <h3>SLA Compliance</h3>
              <div className="metric-number">{analytics?.slaComplianceRate || 0}%</div>
              <div className="metric-label">Within SLA targets</div>
            </div>
            
            <div className="metric-card">
              <h3>AI Accuracy</h3>
              <div className="metric-number">{analytics?.aiAccuracy || 0}%</div>
              <div className="metric-label">AI response accuracy</div>
            </div>
            
            <div className="metric-card">
              <h3>Resolution Rate</h3>
              <div className="metric-number">{analytics?.resolutionRate || 0}%</div>
              <div className="metric-label">Tickets resolved</div>
            </div>

            <div className="metric-card">
              <h3>Backlog</h3>
              <div className="metric-number">{analytics?.backlogCount || 0}</div>
              <div className="metric-label">Open tickets</div>
            </div>

            <div className="metric-card">
              <h3>Avg Resolution Time</h3>
              <div className="metric-number">{analytics?.avgResolutionTimeHours || 0}h</div>
              <div className="metric-label">Average time to resolve</div>
            </div>

            <div className="metric-card">
              <h3>SLA Breaches</h3>
              <div className="metric-number">{analytics?.slaBreachCount || 0}</div>
              <div className="metric-label">SLA violations</div>
            </div>

            <div className="metric-card">
              <h3>Auto-Response Rate</h3>
              <div className="metric-number">{analytics?.autoResponseRate || 0}%</div>
              <div className="metric-label">AI auto-responses</div>
            </div>
          </div>

          {/* Ticket Status Overview */}
          <div className="dashboard-section">
            <h2>Ticket Overview</h2>
            <div className="overview-stats">
              <div className="overview-stat">
                <h4>Total Tickets</h4>
                <div className="stat-number">{analytics?.totalTickets || 0}</div>
              </div>
              <div className="overview-stat">
                <h4>Resolved Tickets</h4>
                <div className="stat-number">{analytics?.resolvedTickets || 0}</div>
              </div>
              <div className="overview-stat">
                <h4>Success Rate</h4>
                <div className="stat-number">{analytics?.resolutionRate || 0}%</div>
              </div>
            </div>
          </div>

          {/* Applied Filters Display */}
          {(filters.startDate || filters.endDate || filters.category || filters.priority) && (
            <div className="dashboard-section">
              <h3>Applied Filters</h3>
              <div className="applied-filters">
                {filters.startDate && <span>Start: {filters.startDate}</span>}
                {filters.endDate && <span>End: {filters.endDate}</span>}
                {filters.category && <span>Category: {filters.category}</span>}
                {filters.priority && <span>Priority: {filters.priority}</span>}
              </div>
            </div>
          )}

          {/* Data Freshness */}
          <div className="dashboard-section">
            <h3>Data Information</h3>
            <div className="data-info">
              <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Date Range:</strong> {analytics?.dateRange?.startDate || 'All time'} to {analytics?.dateRange?.endDate || 'Present'}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;