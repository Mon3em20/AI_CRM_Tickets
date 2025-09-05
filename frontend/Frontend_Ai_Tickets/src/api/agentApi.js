const API_BASE_URL = 'http://localhost:3000/api';

// Agent API functions
export const agentApi = {
  // Handle AI response (approve/edit/reject)
  handleAiResponse: async (ticketId, action, content = null, feedback = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/tickets/${ticketId}/ai-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          content,
          feedback
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to handle AI response');
      }

      return data;
    } catch (error) {
      console.error('Error handling AI response:', error);
      throw error;
    }
  },

  // Escalate ticket
  escalateTicket: async (ticketId, reason, summary = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/tickets/${ticketId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason,
          summary
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to escalate ticket');
      }

      return data;
    } catch (error) {
      console.error('Error escalating ticket:', error);
      throw error;
    }
  },

  // Add manual reply
  addReply: async (ticketId, content, isInternal = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          isInternal
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add reply');
      }

      return data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status, resolution = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          resolution
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update ticket status');
      }

      return data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }
};