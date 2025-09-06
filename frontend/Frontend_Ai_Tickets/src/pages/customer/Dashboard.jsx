import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTickets, getTicketById } from '../../api/ticketApi';
import { toast } from 'react-toastify';
import Navbar from '../../components/Layout/Navbar';

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
      case 'urgent': return '#dc3545';
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

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="customer-dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome, {user?.name}</h1>
            <p>Manage your support tickets and track their progress</p>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => navigate('/customer/create-ticket')}
              className="btn-primary"
            >
              Create New Ticket
            </button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <span className="stat-number">{counts.total}</span>
        </div>
        <div className="stat-card">
          <h3>Open</h3>
          <span className="stat-number" style={{ color: getStatusColor('open') }}>
            {counts.open}
          </span>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <span className="stat-number" style={{ color: getStatusColor('in-progress') }}>
            {counts.inProgress}
          </span>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <span className="stat-number" style={{ color: getStatusColor('resolved') }}>
            {counts.resolved}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>My Tickets</h2>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="waiting-customer">Waiting for Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="tickets-section">
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets found.</p>
            <button 
              onClick={() => navigate('/customer/create-ticket')}
              className="btn-primary"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket.ticketId}</span>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </div>
                
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-description">
                  {ticket.description.length > 100 
                    ? `${ticket.description.substring(0, 100)}...` 
                    : ticket.description
                  }
                </p>
                
                <div className="ticket-meta">
                  <span 
                    className="priority" 
                    style={{ color: getPriorityColor(ticket.priority) }}
                  >
                    Priority: {ticket.priority}
                  </span>
                  <span className="category">Category: {ticket.category}</span>
                  <span className="date">Created: {formatDate(ticket.createdAt)}</span>
                </div>
                
                <div className="ticket-actions">
                  <button 
                    onClick={() => loadTicketDetails(ticket._id)}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {showTicketDetail && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Ticket #{selectedTicket.ticketId}</h2>
              <button 
                onClick={() => setShowTicketDetail(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="ticket-detail">
                <h3>{selectedTicket.title}</h3>
                <div className="ticket-info">
                  <span>Status: {selectedTicket.status}</span>
                  <span>Priority: {selectedTicket.priority}</span>
                  <span>Category: {selectedTicket.category}</span>
                  <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                </div>
                
                <div className="description">
                  <h4>Description</h4>
                  <p>{selectedTicket.description}</p>
                </div>
                
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div className="conversation">
                    <h4>Conversation</h4>
                    {selectedTicket.replies.map((reply, index) => (
                      <div key={index} className={`reply ${reply.author?.role || 'customer'}`}>
                        <div className="reply-header">
                          <span className="author">
                            {reply.author?.name || 'Customer'}
                            {reply.aiGenerated && <span className="ai-badge">AI</span>}
                          </span>
                          <span className="timestamp">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <div className="reply-content">{reply.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
