import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth';

export const register = (userData) => axios.post(`${API_BASE}/register`, userData, { withCredentials: true });
export const login = (credentials) => axios.post(`${API_BASE}/login`, credentials, { withCredentials: true });
export const logout = () => axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
export const getProfile = () => axios.get(`${API_BASE}/me`, { withCredentials: true });