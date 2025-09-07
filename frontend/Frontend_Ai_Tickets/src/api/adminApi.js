import axios from 'axios';

const API_BASE = '/api/admin';

// Configure axios defaults for admin API
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

// Helper function to build query string from filters
const buildQueryString = (filters) => {
  const cleanFilters = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] != null && filters[key] !== undefined) {
      cleanFilters[key] = filters[key];
    }
  });
  
  const params = new URLSearchParams(cleanFilters);
  return params.toString();
};

// Analytics APIs
export const getAnalytics = (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `${API_BASE}/analytics?${queryString}` : `${API_BASE}/analytics`;
  return axios.get(url).then(res => res.data);
};

// Audit Trail APIs
export const getAuditLogs = (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `${API_BASE}/audit?${queryString}` : `${API_BASE}/audit`;
  return axios.get(url).then(res => res.data);
};

// SLA Management APIs
export const listSLA = () => {
  return axios.get(`${API_BASE}/sla`).then(res => res.data);
};

export const createSLA = (data) => {
  return axios.post(`${API_BASE}/sla`, data).then(res => res.data);
};

export const editSLA = (id, data) => {
  return axios.put(`${API_BASE}/sla/${id}`, data).then(res => res.data);
};

export const deleteSLA = (id) => {
  return axios.delete(`${API_BASE}/sla/${id}`).then(res => res.data);
};

// Knowledge Base Management APIs
export const listKB = (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `${API_BASE}/kb?${queryString}` : `${API_BASE}/kb`;
  return axios.get(url).then(res => res.data);
};

export const createKB = (data) => {
  return axios.post(`${API_BASE}/kb`, data).then(res => res.data);
};

export const editKB = (id, data) => {
  return axios.put(`${API_BASE}/kb/${id}`, data).then(res => res.data);
};

export const deleteKB = (id, force = false) => {
  const url = force ? `${API_BASE}/kb/${id}?force=true` : `${API_BASE}/kb/${id}`;
  return axios.delete(url).then(res => res.data);
};

// User Management APIs
export const listUsers = (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `${API_BASE}/users?${queryString}` : `${API_BASE}/users`;
  return axios.get(url).then(res => res.data);
};

export const updateUser = (id, data) => {
  return axios.put(`${API_BASE}/users/${id}`, data).then(res => res.data);
};

export const deleteUser = (id) => {
  return axios.delete(`${API_BASE}/users/${id}`).then(res => res.data);
};
