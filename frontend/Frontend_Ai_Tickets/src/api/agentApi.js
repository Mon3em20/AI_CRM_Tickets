import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export const agentApi = {
  // Handle AI response (approve/edit/reject)
  handleAiResponse: async (ticketId, action, content = null, feedback = null) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/agent/tickets/${ticketId}/ai-response`, {
        action,
        content,
        feedback
      });
      return response.data;
    } catch (error) {
      throwt error.response?.data || error;
    }
  },

  // Escalate ticket
  escalateTicket: async (ticketId, reason, summary = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agent/tickets/${ticketId}/escalate`, {
        reason,
        summary
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add manual reply
  addReply: async (ticketId, content, isInternal = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agent/tickets/${ticketId}/replies`, {
        content,
        isInternal
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status, resolution = null) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/agent/tickets/${ticketId}/status`, {
        status,
        resolution
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};