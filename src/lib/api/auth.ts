import { API_ENDPOINTS } from '../config'
import type {
  LoginRequest,
  RegisterRequest,
  ConfirmEmailRequest,
  AuthResponse,
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
