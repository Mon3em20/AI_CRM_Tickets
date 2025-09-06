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

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
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

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Tickets</h3>
              <div className="metric-number">{analytics?.totalTickets || 0}</div>
              <div className="metric-change">+{analytics?.ticketsThisWeek || 0} this week</div>
            </div>
            
            <div className="metric-card">
              <h3>Active Users</h3>
              <div className="metric-number">{analytics?.activeUsers || 0}</div>
              <div className="metric-change">+{analytics?.newUsersThisWeek || 0} new this week</div>
            </div>
            
            <div className="metric-card">
              <h3>Avg Response Time</h3>
              <div className="metric-number">{analytics?.avgResponseTime || 0}h</div>
              <div className="metric-change">-2h vs last week</div>
            </div>
            
            <div className="metric-card">
              <h3>Resolution Rate</h3>
              <div className="metric-number">{analytics?.resolutionRate || 0}%</div>
              <div className="metric-change">+5% vs last week</div>
            </div>
          </div>

          {/* Ticket Status Overview */}
          <div className="dashboard-section">
            <h2>Ticket Status Overview</h2>
            <div className="status-grid">
              <div className="status-card open">
                <h4>Open Tickets</h4>
                <div className="status-number">{analytics?.openTickets || 0}</div>
              </div>
              <div className="status-card in-progress">
                <h4>In Progress</h4>
                <div className="status-number">{analytics?.inProgressTickets || 0}</div>
              </div>
              <div className="status-card resolved">
                <h4>Resolved</h4>
                <div className="status-number">{analytics?.resolvedTickets || 0}</div>
              </div>
              <div className="status-card closed">
                <h4>Closed</h4>
                <div className="status-number">{analytics?.closedTickets || 0}</div>
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="dashboard-section">
            <h2>Agent Performance</h2>
            <div className="agent-stats">
              {analytics?.agentPerformance?.map(agent => (
                <div key={agent.agentId} className="agent-card">
                  <h4>{agent.name}</h4>
                  <div className="agent-metrics">
                    <span>Assigned: {agent.assignedTickets}</span>
                    <span>Resolved: {agent.resolvedTickets}</span>
                    <span>Avg Time: {agent.avgResolutionTime}h</span>
                  </div>
                </div>
              )) || <p>No agent performance data available</p>}
            </div>
          </div>

          {/* SLA Compliance */}
          <div className="dashboard-section">
            <h2>SLA Compliance</h2>
            <div className="sla-overview">
              <div className="sla-metric">
                <h4>Response Time SLA</h4>
                <div className="sla-percentage">{analytics?.responseTimeSLA || 0}%</div>
              </div>
              <div className="sla-metric">
                <h4>Resolution Time SLA</h4>
                <div className="sla-percentage">{analytics?.resolutionTimeSLA || 0}%</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {analytics?.recentActivity?.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  <span className="activity-description">{activity.description}</span>
                </div>
              )) || <p>No recent activity</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;