/**
 * API Configuration
 * Centralized backend URL configuration for the Tarabaho mobile app
 */

// Get backend URL from environment variable
export const BACKEND_URL = (
  process.env.EXPO_PUBLIC_BACKEND_URL || ''
).replace(/\/$/, ''); // Remove trailing slash if present

// API endpoints
export const API_ENDPOINTS = {
  // Graduate endpoints
  graduate: {
    base: `${BACKEND_URL}/api/graduate`,
    byUsername: (username: string) => `${BACKEND_URL}/api/graduate/username/${username}`,
    uploadProfilePicture: (graduateId: string) => `${BACKEND_URL}/api/graduate/${graduateId}/upload-profile-picture`,
    getToken: `${BACKEND_URL}/api/graduate/get-token`,
  },
  
  // Portfolio endpoints
  portfolio: {
    base: `${BACKEND_URL}/api/portfolio`,
    byGraduate: (graduateId: string) => `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`,
    public: (graduateId: string, shareToken: string) => 
      `${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio?share=${shareToken}`,
    shareToken: (graduateId: string) => 
      `${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/share-token`,
  },
  
  // Project endpoints
  project: {
    base: `${BACKEND_URL}/api/project`,
  },
  
  // Certificate endpoints
  certificate: {
    byGraduate: (graduateId: string) => `${BACKEND_URL}/api/certificate/graduate/${graduateId}`,
  },
  
  // Auth endpoints
  auth: {
    forgotPassword: (userType: 'graduate' | 'employer') => 
      `${BACKEND_URL}/api/${userType}/forgot-password`,
    resetPassword: (userType: 'graduate' | 'employer') => 
      `${BACKEND_URL}/api/${userType}/reset-password`,
    login: (userType: 'graduate' | 'employer') => 
      `${BACKEND_URL}/api/${userType}/login`,
  },
};

// Helper function for API calls with error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default BACKEND_URL;
