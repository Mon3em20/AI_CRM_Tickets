import React, { useState, useEffect } from 'react';
import { getTickets, submitTicket } from '../../api/agentApi';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', priority: 'medium' });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitTicket(formData);
      setFormData({ title: '', description: '', category: '', priority: 'medium' });
      setShowForm(false);
      loadTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2>My Tickets</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'New Ticket'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button type="submit">Submit Ticket</button>
        </form>
      )}

      <div>
        {tickets.map(ticket => (
          <div key={ticket._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{ticket.title}</h3>
            <p>Status: {ticket.status}</p>
            <p>Priority: {ticket.priority}</p>
            <p>Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;