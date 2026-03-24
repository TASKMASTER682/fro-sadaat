import axios from 'axios';

const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://backend-saddat.onrender.com/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

if (typeof window !== 'undefined') {
  console.log('[API] Initialized with URL:', API_URL);
  console.log('[API] Is Production:', isProduction);
}

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => {
    if (typeof window !== 'undefined') {
      console.log('[API] Response:', res.config.url, res.status);
    }
    return res;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      console.error('[API] Error:', error.config?.url, error.message, error.response?.status, error.response?.data);
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('clan_token');
      localStorage.removeItem('clan_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
