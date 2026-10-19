import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicAuth = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    if (token && !isPublicAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses and handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: any): string => {
  if (!error.response) {
    return 'Cannot connect to server. Please ensure the backend service is running and accessible.';
  }

  const { data, status } = error.response;

  // 1. Structured Field-level validation errors
  if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
    const errorList = Object.entries(data.fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ');
    if (errorList) return errorList;
  }

  // 2. Explicit backend error message
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  // 3. Explicit plain-text error response (e.g. CORS or custom filter errors)
  if (typeof data === 'string' && data.trim().length > 0 && !data.trim().startsWith('<')) {
    return data.trim();
  }

  // 4. Fallback based on HTTP status codes
  switch (status) {
    case 400:
      return 'Invalid request details provided.';
    case 401:
      return 'Invalid email or password.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. This record may already exist.';
    case 500:
      return 'An internal server error occurred. Please try again.';
    case 502:
    case 503:
    case 504:
      return 'Backend service is temporarily unavailable. Please verify the server is running.';
    default:
      return `Unexpected error occurred (Code ${status}). Please try again.`;
  }
};

export default api;
