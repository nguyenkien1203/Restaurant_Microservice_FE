// API Configuration
// Update VITE_API_BASE_URL in your .env file or change the fallback value here
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    confirm: `${API_BASE_URL}/api/auth/confirm`,
    resendCode: `${API_BASE_URL}/api/auth/resend-code`,
    me: `${API_BASE_URL}/api/auth/me`, // Get user role
    logout: `${API_BASE_URL}/api/auth/logout`, // Logout and clear cookies
  },
  profile: {
    me: `${API_BASE_URL}/api/profiles/me`,
    update: `${API_BASE_URL}/api/profiles/me`,
    byId: (userId: string) => `${API_BASE_URL}/api/profiles/user/${userId}`,
  },
  menu: {
    all: `${API_BASE_URL}/api/menu/all`,
    byCategory: (category: string) =>
      `${API_BASE_URL}/api/menu/all?category=${category}`,
    // Admin endpoints (require auth)
    admin: `${API_BASE_URL}/api/menu`,
    adminById: (id: string) => `${API_BASE_URL}/api/menu/${id}`,
    uploadUrl: `${API_BASE_URL}/api/menu/upload-url`,
  },
  order: {
    guestCreate: `${API_BASE_URL}/api/orders/guest`,
    memberCreate: `${API_BASE_URL}/api/orders`,
    preOrder: (reservationId: string | number) => `${API_BASE_URL}/api/orders/pre-order/${reservationId}`,
    myOrders: `${API_BASE_URL}/api/orders/my-orders`,
    byId: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    admin: `${API_BASE_URL}/api/orders`,
    updateStatus: (id: string) => `${API_BASE_URL}/api/orders/${id}/status`,
  }

} as const
