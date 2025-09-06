import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export const ticketApi = {
  // Submit new ticket
  submitTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get customer's tickets
  getCustomerTickets: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get specific ticket
  getTicketById: async (ticketId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload attachment
  uploadAttachment: async (ticketId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add reply
  addReply: async (ticketId, content) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/replies`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};