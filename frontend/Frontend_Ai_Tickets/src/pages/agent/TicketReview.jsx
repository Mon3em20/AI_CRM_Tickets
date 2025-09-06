import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketDetails, updateTicketStatus, addTicketReply, handleAiResponse, escalateTicket } from '../../api/agentApi';
import { toast } from 'react-toastify';
import Navbar from '../../components/Layout/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';

const TicketReview = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [editingAI, setEditingAI] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);

  const loadTicketDetails = useCallback(async () => {
    try {
      const response = await getTicketDetails(ticketId);
      setTicket(response.data);
      
      // Check if there's a pending AI response
      const pendingAI = response.data.replies?.find(reply => 
        reply.aiGenerated && !reply.aiMetadata?.approved
      );
      if (pendingAI) {
        setAiResponse(pendingAI);
        setEditedContent(pendingAI.content);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId, loadTicketDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTicket(prev => ({ ...prev, status: newStatus }));
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await addTicketReply(ticketId, { content: replyText });
      toast.success('Reply added successfully');
      setReplyText('');
      loadTicketDetails(); // Reload to get updated replies
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleApproveAI = async () => {
    try {
      await handleAiResponse(ticketId, 'approve');
      toast.success('AI response approved and sent to customer');
      setAiResponse(null);
      loadTicketDetails();
    } catch (error) {
      console.error('Error approving AI response:', error);
      toast.error('Failed to approve AI response');
    }
  };

  const handleEditAI = async () => {
    try {
      await handleAiResponse(ticketId, 'edit', editedContent);
      toast.success('AI response edited and sent to customer');
      setAiResponse(null);
      setEditingAI(false);
      loadTicketDetails();
    } catch (error) {
      console.error('Error editing AI response:', error);
      toast.error('Failed to edit AI response');
    }
  };

  const handleRejectAI = async () => {
    try {
      await handleAiResponse(ticketId, 'reject');
      toast.success('AI response rejected');
      setAiResponse(null);
      loadTicketDetails();
    } catch (error) {
      console.error('Error rejecting AI response:', error);
      toast.error('Failed to reject AI response');
    }
  };

  const handleEscalateTicket = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) return;

    try {
      await escalateTicket(ticketId, escalationReason);
      toast.success('Ticket escalated to senior team');
      setShowEscalation(false);
      setEscalationReason('');
      loadTicketDetails();
    } catch (error) {
      console.error('Error escalating ticket:', error);
      toast.error('Failed to escalate ticket');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSLAStatus = (ticket) => {
    if (!ticket.sla) return 'No SLA';
    
    const now = new Date();
    const breachTime = new Date(ticket.sla.breachTime);
    const warningTime = new Date(ticket.sla.warningTime);

    if (now >= breachTime) return 'Breached';
    if (now >= warningTime) return 'Warning';
    return 'On Track';
  };

  const getSLAColor = (status) => {
    switch (status) {
      case 'Breached': return '#dc3545';
      case 'Warning': return '#ffc107';
      case 'On Track': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading ticket details..." />;
  }

  if (!ticket) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="main-content">
          <div className="dashboard-header">
            <h1>Ticket Not Found</h1>
            <p>The requested ticket could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  const slaStatus = getSLAStatus(ticket);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <div className="ticket-review">
          <div className="dashboard-header">
            <div className="ticket-info">
              <h1>Ticket #{ticket.ticketId}</h1>
              <h2>{ticket.title}</h2>
              <div className="ticket-meta">
                <span className="status">Status: {ticket.status}</span>
                <span className="priority">Priority: {ticket.priority}</span>
                <span 
                  className="sla-status"
              style={{ color: getSLAColor(slaStatus) }}
            >
              SLA: {slaStatus}
            </span>
          </div>
        </div>
        
        <div className="ticket-actions">
          <select 
            value={ticket.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <button 
            onClick={() => setShowEscalation(true)}
            className="btn-escalate"
          >
            Escalate
          </button>
        </div>
      </div>

      <div className="ticket-content">
        <div className="customer-info">
          <h3>Customer Information</h3>
          <p>Name: {ticket.customer?.name}</p>
          <p>Email: {ticket.customer?.email}</p>
          <p>Created: {formatDate(ticket.createdAt)}</p>
        </div>

        <div className="ticket-description">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        {/* AI Response Section */}
        {aiResponse && (
          <div className="ai-response-section">
            <h3>Pending AI Response</h3>
            <div className="ai-response-content">
              {editingAI ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="ai-edit-textarea"
                  rows={6}
                />
              ) : (
                <div className="ai-response-text">{aiResponse.content}</div>
              )}
            </div>
            
            <div className="ai-response-actions">
              {editingAI ? (
                <>
                  <button onClick={handleEditAI} className="btn-primary">
                    Save & Send
                  </button>
                  <button 
                    onClick={() => {
                      setEditingAI(false);
                      setEditedContent(aiResponse.content);
                    }} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleApproveAI} className="btn-approve">
                    Approve & Send
                  </button>
                  <button 
                    onClick={() => setEditingAI(true)} 
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button onClick={handleRejectAI} className="btn-reject">
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Conversation Timeline */}
        <div className="conversation">
          <h3>Conversation</h3>
          <div className="replies">
            {ticket.replies?.map((reply, index) => (
              <div 
                key={index} 
                className={`reply ${reply.author?.role || 'customer'}`}
              >
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
        </div>

        {/* Add Reply Form */}
        <div className="add-reply">
          <h3>Add Reply</h3>
          <form onSubmit={handleAddReply}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              required
            />
            <button type="submit" className="btn-primary">
              Send Reply
            </button>
          </form>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalation && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Escalate Ticket</h3>
            <form onSubmit={handleEscalateTicket}>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Reason for escalation..."
                rows={4}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Escalate
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowEscalation(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default TicketReview;
