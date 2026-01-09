// Auth Types

export interface User {
  email: string
  role: string | null
  active: boolean
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
  role: string | null
  active: boolean
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
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<{ email: string }>
  confirmEmail: (data: ConfirmEmailRequest) => Promise<void>
  resendCode: (email: string) => Promise<void>
  logout: () => void
  clearError: () => void
}
