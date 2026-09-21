import axios from 'axios';

// Backend API URL configured via runtime environment or Vite build variable
const API_BASE_URL =
  (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized access (expired token)
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if already on login/register
      const isAuthPath = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPath && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from API error response
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Network error. Please ensure the backend is running.';
}

export default api;
