import axios from 'axios';

/**
 * Global API Client
 * 
 * Centralized axios instance with base configuration and 
 * JWT authentication interceptors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devnapp:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('devnapp:token');
      // Potential redirect to login logic here
    }
    return Promise.reject(error);
  }
);

export default api;
