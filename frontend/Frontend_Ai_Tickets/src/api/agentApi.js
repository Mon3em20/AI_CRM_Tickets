import axios from 'axios';

const API_BASE = '/api/agent';

// Get agent's assigned tickets with filters
export const getAgentTickets = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.sla) params.append('sla', filters.sla);
  
  const queryString = params.toString();
  const url = queryString ? `${API_BASE}/tickets?${queryString}` : `${API_BASE}/tickets`;
  
  return axios.get(url).then(res => res.data);
};

// Get ticket details with AI suggestions
export const getTicketDetails = (id) => {
  return axios.get(`${API_BASE}/tickets/${id}`).then(res => res.data);
};

// Agent ticket management - matching backend agentController
export const handleAiResponse = (id, action, content = null, feedback = null) => {
  return axios.put(`${API_BASE}/tickets/${id}/ai-response`, { 
    action, // 'approve', 'edit', 'reject'
    content, 
    feedback 
  }).then(res => res.data);
};

export const escalateTicket = (id, reason, summary = null) => {
  return axios.post(`${API_BASE}/tickets/${id}/escalate`, { 
    reason, 
    summary 
  }).then(res => res.data);
};

export const addTicketReply = (id, reply) => {
  const { content, isInternal = false } = reply;
  return axios.post(`${API_BASE}/tickets/${id}/replies`, { content, isInternal }).then(res => res.data);
};

export const updateTicketStatus = (id, status) => {
  return axios.put(`${API_BASE}/tickets/${id}/status`, { status }).then(res => res.data);
};