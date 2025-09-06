import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/tickets';

export const submitTicket = (ticketData) => axios.post(API_BASE, ticketData, { withCredentials: true });
export const getTickets = () => axios.get(API_BASE, { withCredentials: true });
export const getTicketById = (id) => axios.get(`${API_BASE}/${id}`, { withCredentials: true });
export const uploadAttachment = (id, formData) => axios.post(`${API_BASE}/${id}/attachments`, formData, { withCredentials: true });
export const addReply = (id, replyData) => axios.post(`${API_BASE}/${id}/replies`, replyData, { withCredentials: true });