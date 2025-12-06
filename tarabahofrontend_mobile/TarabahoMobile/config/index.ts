/**
 * Application Configuration
 * Centralized configuration for the Tarabaho mobile app
 */

// Backend API Configuration
export const API_CONFIG = {
  // Backend URL from environment variable
  BACKEND_URL: (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, ''),
};

// Validate that required environment variables are set
if (!API_CONFIG.BACKEND_URL) {
  console.warn('Warning: EXPO_PUBLIC_BACKEND_URL is not set. API calls may fail.');
}

export default API_CONFIG;
