// API Configuration
// Update VITE_API_BASE_URL in your .env file or change the fallback value here
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    confirm: `${API_BASE_URL}/api/auth/confirm`,
    resendCode: `${API_BASE_URL}/api/auth/resend-code`,
  },
} as const
