// API Base URL
export const API_BASE_URL = "http://localhost:3001";

// API Endpoints
export const API_ENDPOINTS = {
  USERS: "/users",
  ORDERS: "/orders",
} as const;

// Full API URLs
export const API_URLS = {
  USERS: `${API_BASE_URL}${API_ENDPOINTS.USERS}`,
  ORDERS: `${API_BASE_URL}${API_ENDPOINTS.ORDERS}`,
} as const;
