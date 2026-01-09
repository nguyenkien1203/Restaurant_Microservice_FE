import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import {
  loginApi,
  registerApi,
  confirmEmailApi,
  resendCodeApi,
} from './api/auth'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  ConfirmEmailRequest,
  AuthContextType,
} from './types/auth'

const AUTH_STORAGE_KEY = 'aperture_dining_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  return null
}

function storeUser(user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await loginApi(credentials)
      const userData: User = {
        email: response.email,
        role: response.role,
        active: response.active,
      }
      setUser(userData)
      storeUser(userData)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register does NOT auto-login - user must confirm email first
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await registerApi(data)
      // Return the email so the caller can redirect to confirmation page
      return { email: response.email }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const confirmEmail = useCallback(async (data: ConfirmEmailRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      await confirmEmailApi(data)
      // Email confirmed successfully - user can now login
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Email confirmation failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resendCode = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await resendCodeApi(email)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to resend code. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearStoredUser()
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    confirmEmail,
    resendCode,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
