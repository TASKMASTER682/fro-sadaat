import axios from 'axios';

const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://backend-saddat.onrender.com/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

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
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      const isMeRoute = error.config?.url?.includes('/auth/me');
      if (!isAuthRoute && !isMeRoute) {
        localStorage.removeItem('clan_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
