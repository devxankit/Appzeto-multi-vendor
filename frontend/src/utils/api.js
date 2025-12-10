import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Check if request was blocked (multiple ways ad blockers can block)
    const isBlocked = 
      error.code === 'ERR_BLOCKED_BY_CLIENT' ||
      error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
      error.message?.includes('blocked by client') ||
      (error.response?.status === 0 && !navigator.onLine === false) || // Status 0 often means blocked
      error.request?.status === 0;
    
    // Handle blocked requests - silently fail, no errors shown
    if (isBlocked) {
      // Return a resolved promise with empty data to prevent app breakage
      // This allows the app to continue working even when requests are blocked
      return Promise.resolve({
        success: false,
        data: null,
        message: '',
        blocked: true
      });
    }

    // Handle actual network errors (when backend is down)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Only show network error if backend is actually down, not blocked
      if (!navigator.onLine) {
        toast.error('No internet connection. Please check your network.');
      } else {
        toast.error('Unable to reach server. Please try again later.');
      }
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    
    // Show error toast only for actual API errors, not blocked requests
    if (error.response?.status && error.response?.status !== 0) {
      toast.error(message);
    }
    
    // Handle 401 (Unauthorized) - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

export default api;

