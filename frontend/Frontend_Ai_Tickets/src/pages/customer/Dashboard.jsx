import React, { useState, useEffect } from 'react';
import { ticketApi } from '../../api/ticketApi';

const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const result = await ticketApi.getCustomerTickets();
      setTickets(result.tickets);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading tickets...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>My Tickets</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div>
          {tickets.map(ticket => (
            <div key={ticket._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{ticket.title}</h3>
              <p><strong>Ticket ID:</strong> {ticket.ticketId}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Category:</strong> {ticket.category}</p>
              <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;