import React, { useState } from 'react';
import { agentApi } from '../../api/agentApi';

const AgentDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState('TKT-000001');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // AI Response Handler
  const [aiAction, setAiAction] = useState('approve');
  const [aiContent, setAiContent] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');

  // Reply Handler
  const [replyContent, setReplyContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // Status Handler
  const [ticketStatus, setTicketStatus] = useState('open');
  const [resolution, setResolution] = useState('');

  // Escalation Handler
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationSummary, setEscalationSummary] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const handleAiResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const result = await agentApi.handleAiResponse(
        selectedTicket,
        aiAction,
        aiAction === 'edit' ? aiContent : null,
        aiFeedback || null
      );
      setMessage(`AI response ${aiAction}ed successfully`);
      setAiContent('');
      setAiFeedback('');
    } catch (err) {
      setError(err.message || 'Failed to handle AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setError('Reply content is required');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await agentApi.addReply(selectedTicket, replyContent, isInternal);
      setMessage('Reply added successfully');
      setReplyContent('');
    } catch (err) {
      setError(err.message || 'Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const result = await agentApi.updateTicketStatus(
        selectedTicket,
        ticketStatus,
        resolution || null
      );
      setMessage(`Ticket status updated to ${ticketStatus}`);
      setResolution('');
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalation = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
      setError('Escalation reason is required');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await agentApi.escalateTicket(
        selectedTicket,
        escalationReason,
        escalationSummary || null
      );
      setMessage('Ticket escalated successfully');
      setEscalationReason('');
      setEscalationSummary('');
    } catch (err) {
      setError(err.message || 'Failed to escalate ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Agent Dashboard</h1>
      
      {/* Messages */}
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}
      
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

      {/* Ticket Selection */}
      <div style={{ marginBottom: '30px' }}>
        <label>
          <strong>Select Ticket ID:</strong>
          <input
            type="text"
            value={selectedTicket}
            onChange={(e) => setSelectedTicket(e.target.value)}
            style={{ 
              marginLeft: '10px', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            placeholder="e.g., TKT-000001"
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* AI Response Handler */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Handle AI Response</h3>
          <form onSubmit={handleAiResponse}>
            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Action:</strong>
                <select
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value)}
                  style={{ 
                    marginLeft: '10px', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="approve">Approve</option>
                  <option value="edit">Edit</option>
                  <option value="reject">Reject</option>
                </select>
              </label>
            </div>

            {aiAction === 'edit' && (
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <strong>Edited Content:</strong>
                  <textarea
                    value={aiContent}
                    onChange={(e) => setAiContent(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      minHeight: '80px',
                      marginTop: '5px'
                    }}
                    placeholder="Enter edited content..."
                  />
                </label>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Feedback (optional):</strong>
                <textarea
                  value={aiFeedback}
                  onChange={(e) => setAiFeedback(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '60px',
                    marginTop: '5px'
                  }}
                  placeholder="Optional feedback..."
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : `${aiAction.charAt(0).toUpperCase() + aiAction.slice(1)} AI Response`}
            </button>
          </form>
        </div>

        {/* Add Reply */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Add Reply</h3>
          <form onSubmit={handleAddReply}>
            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Reply Content:</strong>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '100px',
                    marginTop: '5px'
                  }}
                  placeholder="Enter your reply..."
                  required
                />
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <strong>Internal Note</strong>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add Reply'}
            </button>
          </form>
        </div>

        {/* Update Status */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Update Status</h3>
          <form onSubmit={handleStatusUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Status:</strong>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  style={{ 
                    marginLeft: '10px', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="waiting-customer">Waiting Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </div>

            {(ticketStatus === 'resolved' || ticketStatus === 'closed') && (
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <strong>Resolution Notes:</strong>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      minHeight: '80px',
                      marginTop: '5px'
                    }}
                    placeholder="Enter resolution details..."
                  />
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>

        {/* Escalate Ticket */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Escalate Ticket</h3>
          <form onSubmit={handleEscalation}>
            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Escalation Reason:</strong>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '80px',
                    marginTop: '5px'
                  }}
                  placeholder="Why is this ticket being escalated?"
                  required
                />
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <strong>Summary (optional):</strong>
                <textarea
                  value={escalationSummary}
                  onChange={(e) => setEscalationSummary(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '60px',
                    marginTop: '5px'
                  }}
                  placeholder="Optional summary for senior team..."
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Escalating...' : 'Escalate Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;