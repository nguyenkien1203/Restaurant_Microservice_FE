import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import {
  loginApi,
  registerApi,
  confirmEmailApi,
  resendCodeApi,
  getAuthMeApi,
  logoutApi,
} from './api/auth'
import { getMyProfile } from './api/profile'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  ConfirmEmailRequest,
  AuthContextType,
} from './types/auth'

const AUTH_STORAGE_KEY = 'aperture_dining_user'

// Global event for session expiration - can be triggered from any API call
const SESSION_EXPIRED_EVENT = 'aperture:session-expired'

export function triggerSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}

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
  const [sessionExpired, setSessionExpired] = useState(false)
  const isValidatingSession = useRef(false)

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    if (sessionExpired) return // Prevent multiple triggers
    setSessionExpired(true)
    setUser(null)
    clearStoredUser()
  }, [sessionExpired])

  // Dismiss session expired modal and navigate to login
  const dismissSessionExpired = useCallback(() => {
    setSessionExpired(false)
  }, [])

  // Validate session by calling auth/me endpoint
  const validateSession = useCallback(async () => {
    const storedUser = getStoredUser()
    if (!storedUser || isValidatingSession.current) return

    isValidatingSession.current = true
    try {
      await getAuthMeApi()
      // Session is valid, user can continue
    } catch (err) {
      // Session is invalid - trigger expiry
      console.log('Session validation failed, logging out')
      handleSessionExpired()
    } finally {
      isValidatingSession.current = false
    }
  }, [handleSessionExpired])

  // Load user from localStorage on mount and validate session
  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
      // Validate session on mount
      validateSession()
    }
    setIsLoading(false)
  }, [])

  // Listen for global session expired events (from API calls)
  useEffect(() => {
    const handleGlobalSessionExpired = () => {
      handleSessionExpired()
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleGlobalSessionExpired)
    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleGlobalSessionExpired,
      )
    }
  }, [handleSessionExpired])

  // Validate session when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      const storedUser = getStoredUser()
      if (storedUser) {
        validateSession()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [validateSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Call login API (sets the cookie)
      const loginResponse = await loginApi(credentials)

      // Extract token from response (handle different possible field names)
      const token =
        loginResponse.token ||
        loginResponse.accessToken ||
        loginResponse.jwt ||
        loginResponse.securedLoginToken

      // Step 2: Fetch user role from /api/auth/me (requires cookie)
      let userRole: string | null =
        loginResponse.role || loginResponse.roles || null
      try {
        const authMe = await getAuthMeApi()
        userRole = authMe.roles || userRole
      } catch {
        // If auth/me fails, use role from login response
        console.warn('Could not fetch user role from /api/auth/me')
      }

      // Step 3: Fetch user profile to get fullName (requires cookie)
      let fullName = loginResponse.fullName || credentials.email.split('@')[0]
      try {
        const profile = await getMyProfile()
        fullName = profile.fullName || fullName
      } catch {
        // If profile fetch fails, use fallback
        console.warn('Could not fetch user profile')
      }

      const userData: User = {
        email: loginResponse.email || credentials.email,
        fullName: fullName,
        role: userRole,
        active: loginResponse.active ?? true,
        token: token,
      }
      setUser(userData)
      storeUser(userData)
      return userData
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

  const logout = useCallback(async () => {
    // Call the logout API to clear server-side cookies
    try {
      await logoutApi()
    } catch (err) {
      // Even if API fails, still clear local state
      console.warn('Logout API failed:', err)
    }
    // Clear local state
    setUser(null)
    clearStoredUser()
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getToken = useCallback(() => {
    return user?.token || null
  }, [user])

  // Update user data (e.g., after fetching profile)
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser
      const updatedUser = { ...currentUser, ...updates }
      storeUser(updatedUser)
      return updatedUser
    })
  }, [])

  // Role checking helpers
  const isAdmin = useCallback(() => {
    return user?.role === 'ROLE_ADMIN'
  }, [user])

  const isUser = useCallback(() => {
    return user?.role === 'ROLE_USER'
  }, [user])

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
    getToken,
    updateUser,
    isAdmin,
    isUser,
    sessionExpired,
    dismissSessionExpired,
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
