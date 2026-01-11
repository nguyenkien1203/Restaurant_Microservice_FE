// Auth Types

export interface User {
  email: string
  fullName: string
  role: string | null
  active: boolean
  token?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
}

export interface AuthResponse {
  email: string
  fullName: string
  role?: string | null
  roles?: string | null // API returns "roles" field
  active: boolean
  authenticated?: boolean
  token?: string
  accessToken?: string
  jwt?: string
  securedLoginToken?: string
}

export interface ConfirmEmailRequest {
  email: string
  confirmationCode: string
}

export interface ResendCodeRequest {
  email: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<User>
  register: (data: RegisterRequest) => Promise<{ email: string }>
  confirmEmail: (data: ConfirmEmailRequest) => Promise<void>
  resendCode: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  getToken: () => string | null
  updateUser: (updates: Partial<User>) => void
  isAdmin: () => boolean
  isUser: () => boolean
  sessionExpired: boolean
  dismissSessionExpired: () => void
}

// Role constants
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
} as const

// Response from /api/auth/me endpoint
export interface AuthMeResponse {
  roles: string
  email: string
  authenticated: boolean
}
