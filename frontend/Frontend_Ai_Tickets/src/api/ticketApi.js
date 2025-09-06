import axios from 'axios';

const API_BASE = '/api/tickets';

// Ticket CRUD operations - matching backend ticketController
export const getTickets = (params = {}) => axios.get(API_BASE, { params }).then(res => res.data);
export const getTicketById = (id) => axios.get(`${API_BASE}/${id}`).then(res => res.data);
export const createTicket = (data) => {
  const { title, description, category, priority = 'medium' } = data;
  return axios.post(API_BASE, { title, description, category, priority }).then(res => res.data);
};

// Ticket actions - matching backend endpoints
export const addTicketReply = (id, reply) => {
  const { content } = reply;
  return axios.post(`${API_BASE}/${id}/replies`, { content }).then(res => res.data);
};

// File upload - matching backend uploadAttachment
export const uploadTicketAttachment = (id, file) => {
  const formData = new FormData();
  formData.append('attachment', file);
  return axios.post(`${API_BASE}/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
