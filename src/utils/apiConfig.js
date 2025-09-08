// API Configuration utility
import axios from "axios";

// const isDevelopment = import.meta.env.DEV || __DEV__;
const isDevelopment = import.meta.env.DEV === true;

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
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Helper function to log API calls in development
export const logApiCall = (method, url, data = null) => {
  if (isDevelopment) {
    console.log(`🚀 API Call: ${method.toUpperCase()} ${url}`, data ? { data } : '');
  }
}; 