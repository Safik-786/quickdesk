import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qd_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalize errors ───────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    // Auto-logout on 401
    if (status === 401) {
      localStorage.removeItem('qd_token');
      localStorage.removeItem('qd_user');
      window.location.href = '/login';
    }

    const normalizedError = new Error(
      Array.isArray(message) ? message.join(', ') : message,
    );
    normalizedError.status = status;
    normalizedError.data = error.response?.data;
    return Promise.reject(normalizedError);
  },
);
