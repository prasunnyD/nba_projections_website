// API Configuration utility
const isDevelopment = import.meta.env.DEV || __DEV__;

// Base URL configuration
export const getApiBaseUrl = () => {
  if (isDevelopment) {
    // In development, use the proxy (relative URL)
    return '/api';
  }
  // In production, use the actual API URL
  return 'https://api.sharpr-analytics.com';
};

// Create axios instance with proper configuration
export const createApiClient = () => {
  const axios = require('axios');
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Helper function to log API calls in development
export const logApiCall = (method, url, data = null) => {
  if (isDevelopment) {
    console.log(`🚀 API Call: ${method.toUpperCase()} ${url}`, data ? { data } : '');
  }
}; 