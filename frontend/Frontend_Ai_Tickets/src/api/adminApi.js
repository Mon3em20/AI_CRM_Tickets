import axios from 'axios';

const API_BASE = '/api/admin';

export const getAnalytics = () => axios.get(`${API_BASE}/analytics`).then(res => res.data);
export const getAuditLogs = (params = {}) => axios.get(`${API_BASE}/audit`, { params }).then(res => res.data);
export const listSLA = () => axios.get(`${API_BASE}/sla`).then(res => res.data);
export const createSLA = (data) => axios.post(`${API_BASE}/sla`, data).then(res => res.data);
export const editSLA = (id, data) => axios.put(`${API_BASE}/sla/${id}`, data).then(res => res.data);
export const deleteSLA = (id) => axios.delete(`${API_BASE}/sla/${id}`).then(res => res.data);
