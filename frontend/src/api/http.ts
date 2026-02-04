import axios from 'axios';
import { getToken, clearAuth } from '../store/auth';

/**
 * Axios instance with interceptors for JWT injection and error handling.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
});

// Request interceptor - attach token
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }

    const serverMessage = err.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      err.message = serverMessage;
    }
    return Promise.reject(err);
  }
);
