import axios from 'axios';

const API_BASE = '/api/auth';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

// Request interceptor to add auth token
axios.interceptors.request.use((config) => {
  return config;
});

// Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions matching backend endpoints
export const register = (userData) => {
  const { name, email, password, phone, role = 'customer' } = userData;
  return axios.post(`${API_BASE}/register`, { name, email, password, phone, role }).then(res => res.data);
};

export const login = (credentials) => {
  const { email, password } = credentials;
  return axios.post(`${API_BASE}/login`, { email, password }).then(res => res.data);
};

export const logout = () => axios.post(`${API_BASE}/logout`).then(res => res.data);

export const getCurrentUser = () => axios.get(`${API_BASE}/me`).then(res => res.data);