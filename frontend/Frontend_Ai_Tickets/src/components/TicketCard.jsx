import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const TicketCard = ({ ticket, onClick, showAssignedAgent = false }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#007bff';
      case 'in-progress': return '#fd7e14';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="ticket-card" onClick={() => onClick?.(ticket)}>
      <div className="ticket-header">
        <div className="ticket-id">#{ticket.ticketId}</div>
        <div className="ticket-meta">
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
          >
            {ticket.priority}
          </span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(ticket.status) }}
          >
            {ticket.status}
          </span>
        </div>
      </div>
      
      <div className="ticket-content">
        <h3 className="ticket-title">{ticket.title}</h3>
        <p className="ticket-description">
          {ticket.description?.length > 100 
            ? `${ticket.description.substring(0, 100)}...`
            : ticket.description
          }
        </p>
        
        <div className="ticket-details">
          <div className="ticket-info">
            <span>Category: <strong>{ticket.category}</strong></span>
            {showAssignedAgent && ticket.assignedAgent && (
              <span>Agent: <strong>{ticket.assignedAgent.name}</strong></span>
            )}
          </div>
          
          <div className="ticket-dates">
            <span>Created: {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            {ticket.dueDate && (
              <span>Due: {formatDistanceToNow(new Date(ticket.dueDate), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;