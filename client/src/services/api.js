import axios from 'axios';
import { handleMockRequest } from './mockStore.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  adapter: async (config) => {
    // If no backend API URL is set (standalone static Netlify mode), use mock adapter directly to prevent console 404 network errors
    if (!import.meta.env.VITE_API_URL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const url = config.url || '';
      const method = (config.method || 'GET').toUpperCase();
      let body = null;
      if (config.data) {
        try {
          body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        } catch {
          body = config.data;
        }
      }
      const mock = handleMockRequest(url, method, body);
      return {
        data: mock.data,
        status: mock.status,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config
      };
    }
    // Standard HTTP adapter for local dev or live backend
    return axios.defaults.adapter(config);
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => {
    // If Netlify SPA rewrite returned HTML index.html (string starting with '<!DOCTYPE' or '<html')
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      const mock = handleMockRequest(response.config.url, response.config.method?.toUpperCase(), response.config.data ? JSON.parse(response.config.data) : null);
      return { ...response, status: mock.status, data: mock.data };
    }
    return response;
  },
  error => {
    // Fallback to demo mock store if network fails, or 404/500 occurred
    const isDemoToken = localStorage.getItem('civicpulse_token')?.startsWith('demo-');
    const isDemoUser = localStorage.getItem('civicpulse_user')?.includes('civicpulse.demo');

    if (isDemoToken || isDemoUser || !error.response || error.response.status === 404) {
      try {
        const body = error.config?.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : null;
        const mock = handleMockRequest(error.config?.url || '', error.config?.method?.toUpperCase() || 'GET', body);
        return Promise.resolve({
          status: mock.status,
          data: mock.data,
          headers: {},
          config: error.config
        });
      } catch (mockErr) {
        console.warn('Mock fallback error:', mockErr);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
