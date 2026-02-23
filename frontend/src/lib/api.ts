import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh itself fails with 401
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        const { accessToken } = response.data.data;

        // Update both store and localStorage
        localStorage.setItem('auth_token', accessToken);
        useAuthStore.setState({ token: accessToken });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear everything using the store's logout logic
        useAuthStore.getState().logout();

        // Use a small delay before reloading to allow state to settle, 
        // or just rely on the re-render since App.tsx will see isAuthenticated: false
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
