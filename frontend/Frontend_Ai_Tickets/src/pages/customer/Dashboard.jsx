import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTickets, getTicketById } from '../../api/ticketApi';
import { toast } from 'react-toastify';
import Navbar from '../../components/Layout/Navbar';
import Sidebar from '../../components/Layout/Sidebar';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      if (response.status === 'success') {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const response = await getTicketById(ticketId);
      if (response.status === 'success') {
        setSelectedTicket(response.data);
        setShowTicketDetail(true);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Failed to load ticket details');
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

  const getTicketCounts = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  };

  const getFilteredTickets = () => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter(ticket => ticket.status === statusFilter);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#007bff';
      case 'in-progress': return '#fd7e14';
      case 'waiting-customer': return '#ffc107';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const counts = getTicketCounts();
  const filteredTickets = getFilteredTickets();

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
            <div className="loader-text">Loading Customer Dashboard...</div>
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
            <h2>🌟 Welcome Back, {user?.name}!</h2>
            <p>Your personal support center and ticket management hub</p>
          </div>

          {/* Enhanced Header */}
          <div className="dashboard-header">
            <h1>🎫 My Support Dashboard</h1>
            <p>Track your support tickets and get help when you need it</p>
            <div className="header-actions">
              <button 
                onClick={() => navigate('/customer/create-ticket')}
                className="btn btn-primary"
              >
                ✨ Create New Ticket
              </button>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>📊 Your Ticket Overview</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card gentle-float">
                <div className="stat-icon total">📋</div>
                <div className="stat-number">{counts.total}</div>
                <div className="stat-label">Total Tickets</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon open">🟡</div>
                <div className="stat-number" style={{ color: getStatusColor('open') }}>
                  {counts.open}
                </div>
                <div className="stat-label">Open Tickets</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon">🔄</div>
                <div className="stat-number" style={{ color: getStatusColor('in-progress') }}>
                  {counts.inProgress}
                </div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card gentle-float">
                <div className="stat-icon resolved">✅</div>
                <div className="stat-number" style={{ color: getStatusColor('resolved') }}>
                  {counts.resolved}
                </div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🔍 Filter Your Tickets</h3>
            </div>
            <div className="filters-section">
              <div className="filter-group">
                <label className="filter-label">📊 Status Filter:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">🌟 All Tickets</option>
                  <option value="open">🟡 Open</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="waiting-customer">⏳ Waiting for Customer</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="closed">🔒 Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Tickets List */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🎫 My Support Tickets</h3>
            </div>
            <div className="tickets-section">
              {filteredTickets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <h3>No Tickets Found</h3>
                  <p>You don't have any tickets matching the current filter.</p>
                  <button 
                    onClick={() => navigate('/customer/create-ticket')}
                    className="btn btn-primary"
                  >
                    ✨ Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="tickets-grid">
                  {filteredTickets.map(ticket => (
                    <div key={ticket._id} className="ticket-card stagger-item">
                      <div className="ticket-header">
                        <span className="ticket-id">#{ticket.ticketId}</span>
                        <span 
                          className={`ticket-status ${ticket.status}`}
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      
                      <h3 className="ticket-title">🎯 {ticket.title}</h3>
                      <p className="ticket-description">
                        {ticket.description.length > 100 
                          ? `${ticket.description.substring(0, 100)}...` 
                          : ticket.description
                        }
                      </p>
                      
                      <div className="ticket-meta">
                        <div className="meta-item">
                          <span className="meta-label">⚡ Priority:</span>
                          <span 
                            className="meta-value priority"
                            style={{ color: getPriorityColor(ticket.priority) }}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">🏷️ Category:</span>
                          <span className="meta-value">{ticket.category}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">📅 Created:</span>
                          <span className="meta-value">{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="ticket-actions">
                        <button 
                          onClick={() => loadTicketDetails(ticket._id)}
                          className="btn btn-primary"
                        >
                          👁️ View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="card-header">
              <h3>🚀 Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <div className="quick-action-card" onClick={() => navigate('/customer/create-ticket')}>
                <div className="quick-action-icon">✨</div>
                <div className="quick-action-title">Create Ticket</div>
                <div className="quick-action-desc">Submit a new support request</div>
              </div>
              <div className="quick-action-card" onClick={() => setStatusFilter('open')}>
                <div className="quick-action-icon">👁️</div>
                <div className="quick-action-title">View Open</div>
                <div className="quick-action-desc">See all open tickets</div>
              </div>
              <div className="quick-action-card" onClick={() => setStatusFilter('resolved')}>
                <div className="quick-action-icon">✅</div>
                <div className="quick-action-title">Check Resolved</div>
                <div className="quick-action-desc">Review resolved tickets</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Ticket Detail Modal */}
      {showTicketDetail && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>🎫 Ticket #{selectedTicket.ticketId}</h2>
              <button 
                onClick={() => setShowTicketDetail(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="ticket-detail">
                <h3>🎯 {selectedTicket.title}</h3>
                <div className="ticket-info">
                  <div className="info-item">
                    <label>📊 Status:</label>
                    <span className={`ticket-status ${selectedTicket.status}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>⚡ Priority:</label>
                    <span style={{ color: getPriorityColor(selectedTicket.priority) }}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>🏷️ Category:</label>
                    <span>{selectedTicket.category}</span>
                  </div>
                  <div className="info-item">
                    <label>📅 Created:</label>
                    <span>{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>
                
                <div className="description">
                  <h4>📝 Description</h4>
                  <p>{selectedTicket.description}</p>
                </div>
                
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div className="conversation">
                    <h4>💬 Conversation History</h4>
                    <div className="conversation-timeline">
                      {selectedTicket.replies.map((reply, index) => (
                        <div key={index} className={`conversation-message ${reply.author?.role || 'customer'}`}>
                          <div className="message-avatar">
                            {reply.author?.name?.charAt(0) || 'C'}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-author">
                                {reply.author?.name || 'Customer'}
                                {reply.aiGenerated && <span className="badge badge-info">🤖 AI</span>}
                              </span>
                              <span className="message-time">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <div className="message-text">{reply.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
