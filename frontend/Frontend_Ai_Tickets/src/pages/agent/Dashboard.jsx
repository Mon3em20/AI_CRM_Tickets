import React, { useState, useEffect, useCallback } from 'react';
import { getAgentTickets, updateTicketStatus } from '../../api/agentApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import Sidebar from '../../components/Layout/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sla: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAgentTickets(filters);
      const ticketData = response.data || [];
      setTickets(ticketData);
      
      // Calculate stats
      const calculatedStats = {
        total: ticketData.length,
        open: ticketData.filter(t => t.status === 'open').length,
        inProgress: ticketData.filter(t => t.status === 'in-progress').length,
        resolved: ticketData.filter(t => t.status === 'resolved').length,
        overdue: ticketData.filter(t => t.sla?.breachTime && new Date(t.sla.breachTime) <= new Date()).length
      };
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      toast.success('Ticket status updated successfully');
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const getSLAColor = (ticket) => {
    if (ticket.sla?.breachTime && new Date(ticket.sla.breachTime) <= new Date()) {
      return '#dc3545'; // red
    }
    if (ticket.sla?.warningTime && new Date(ticket.sla.warningTime) <= new Date()) {
      return '#ffc107'; // yellow
    }
    return '#28a745'; // green
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
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
            <div className="loader-text">Loading Agent Dashboard...</div>
          </div>
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
            <h2>🎯 Welcome Back, Agent!</h2>
            <p>Your ticket management hub - {user?.name}</p>
          </div>

          {/* Enhanced Header */}
          <div className="dashboard-header">
            <h1>🎫 Agent Dashboard</h1>
            <p>Manage your assigned tickets efficiently</p>
          </div>

          {/* Agent Statistics */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>📊 Your Performance Metrics</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card gentle-float">
                <div className="stat-icon total">📋</div>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Assigned</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon open">🟡</div>
                <div className="stat-number">{stats.open}</div>
                <div className="stat-label">Open Tickets</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon">🔄</div>
                <div className="stat-number">{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon resolved">✅</div>
                <div className="stat-number">{stats.resolved}</div>
                <div className="stat-label">Resolved</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon overdue">⚠️</div>
                <div className="stat-number">{stats.overdue}</div>
                <div className="stat-label">SLA Critical</div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🔍 Filter & Sort Tickets</h3>
            </div>
            <div className="filters">
              <div className="filter-group">
                <label className="filter-label">📊 Status:</label>
                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="open">🟡 Open</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="waiting-customer">⏳ Waiting Customer</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="closed">🔒 Closed</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">⚡ Priority:</label>
                <select 
                  name="priority" 
                  value={filters.priority} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Priority</option>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">⏱️ SLA Status:</label>
                <select 
                  name="sla" 
                  value={filters.sla} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All SLA</option>
                  <option value="critical">⚠️ SLA Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Tickets List */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🎫 Your Assigned Tickets</h3>
            </div>
            <div className="tickets-container">
              {tickets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <h3>No Tickets Assigned</h3>
                  <p>You don't have any tickets assigned to you at the moment.</p>
                </div>
              ) : (
                <div className="tickets-grid">
                  {tickets.map(ticket => (
                    <div key={ticket._id} className="ticket-card stagger-item">
                      <div className="ticket-header">
                        <span className="ticket-id">#{ticket.ticketId}</span>
                        <div className="ticket-badges">
                          <span 
                            className={`ticket-priority ${ticket.priority}`}
                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                          >
                            {ticket.priority}
                          </span>
                          <span 
                            className="sla-indicator" 
                            style={{ backgroundColor: getSLAColor(ticket) }}
                          >
                            SLA
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="ticket-title">🎯 {ticket.title}</h3>
                      
                      <div className="ticket-meta">
                        <div className="meta-item">
                          <span className="meta-label">👤 Customer:</span>
                          <span className="meta-value">{ticket.customer?.name}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">📊 Status:</span>
                          <span className={`ticket-status ${ticket.status}`}>{ticket.status}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">🏷️ Category:</span>
                          <span className="meta-value">{ticket.category}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">📅 Created:</span>
                          <span className="meta-value">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="ticket-actions">
                        <button 
                          onClick={() => navigate(`/agent/tickets/${ticket._id}`)}
                          className="btn btn-primary"
                        >
                          👁️ View Details
                        </button>
                        
                        <select 
                          value={ticket.status} 
                          onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="open">🟡 Open</option>
                          <option value="in-progress">🔄 In Progress</option>
                          <option value="waiting-customer">⏳ Waiting Customer</option>
                          <option value="resolved">✅ Resolved</option>
                          <option value="closed">🔒 Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agent Performance Summary */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🏆 Performance Summary</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>🎯 Resolution Rate:</label>
                <span>{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
              </div>
              <div className="info-item">
                <label>⚡ Active Workload:</label>
                <span>{stats.open + stats.inProgress} tickets</span>
              </div>
              <div className="info-item">
                <label>🕒 Last Updated:</label>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="info-item">
                <label>👤 Agent:</label>
                <span>{user?.name} ({user?.role})</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
