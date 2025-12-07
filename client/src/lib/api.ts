import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ USE accessToken instead of token
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Only logout if not on auth pages and not during initial load
          { const publicPaths = ['/login', '/register', '/auth/callback', '/'];
          const currentPath = window.location.pathname;
          
          if (!publicPaths.includes(currentPath)) {
            // Don't show toast - just silently redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('currentOrganizationId');
            localStorage.removeItem('currentBrandId');
            
            // Use window.location for hard redirect
            window.location.href = '/login';
          }
          break; }
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found - silently ignore
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;
        case 429:
          // Too many requests
          console.error('Rate limit exceeded');
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    if (apiError?.message) {
      return apiError.message;
    }
    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors.map(e => e.message).join(', ');
    }
  }
  return 'An unexpected error occurred';
};

export default api;