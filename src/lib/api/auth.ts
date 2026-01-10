import { API_ENDPOINTS } from '../config'
import type {
  LoginRequest,
  RegisterRequest,
  ConfirmEmailRequest,
  AuthResponse,
  AuthMeResponse,
} from '../types/auth'

class AuthApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

export async function loginApi(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session-based auth
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Login failed. Please check your credentials.',
      response.status
    )
  }

  return response.json()
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.auth.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Registration failed. Please try again.',
      response.status
    )
  }

  return response.json()
}

export async function confirmEmailApi(data: ConfirmEmailRequest): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.confirm, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Email confirmation failed. Please check your code.',
      response.status
    )
  }
}

export async function resendCodeApi(email: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.resendCode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Failed to resend code. Please try again.',
      response.status
    )
  }
}

// Get current authenticated user info (role, email)
export async function getAuthMeApi(): Promise<AuthMeResponse> {
  const response = await fetch(API_ENDPOINTS.auth.me, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session-based auth
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Failed to get user info.',
      response.status
    )
  }

  return response.json()
}

// Logout and clear auth cookies on the server
export async function logoutApi(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies so server can clear them
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new AuthApiError(
      errorData.message || 'Logout failed.',
      response.status
    )
  }
}
