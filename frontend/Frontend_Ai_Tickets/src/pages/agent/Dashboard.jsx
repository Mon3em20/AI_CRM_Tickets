import React, { useState, useEffect, useCallback } from 'react';
import { getAgentTickets, updateTicketStatus } from '../../api/agentApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Layout/Navbar';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
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
      setTickets(response.data || []);
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
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="agent-dashboard">
        <div className="dashboard-header">
          <h2>Agent Dashboard - My Assigned Tickets</h2>
        
        {/* Filters */}
        <div className="filters">
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            name="priority" 
            value={filters.priority} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select 
            name="sla" 
            value={filters.sla} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All SLA</option>
            <option value="critical">SLA Critical</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="tickets-container">
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="no-tickets">No tickets assigned to you</div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket.ticketId}</span>
                  <span 
                    className="priority-badge" 
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
                
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-customer">Customer: {ticket.customer?.name}</p>
                <p className="ticket-status">Status: {ticket.status}</p>
                <p className="ticket-category">Category: {ticket.category}</p>
                
                <div className="ticket-actions">
                  <button 
                    onClick={() => navigate(`/agent/tickets/${ticket._id}`)}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                  
                  <select 
                    value={ticket.status} 
                    onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting-customer">Waiting Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
