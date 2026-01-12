import { API_ENDPOINTS } from '../config'
import { triggerSessionExpired } from '../auth-context'
import type { UserProfile, UpdateProfileRequest } from '../types/profile'

class ProfileApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'ProfileApiError'
  }
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await fetch(API_ENDPOINTS.profile.me, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // This sends cookies with cross-origin requests
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new ProfileApiError('Session expired', 401)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new ProfileApiError(
      errorData.message || 'Failed to fetch profile.',
      response.status
    )
  }

  return response.json()
}

export async function updateMyProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  const response = await fetch(API_ENDPOINTS.profile.update, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new ProfileApiError('Session expired', 401)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new ProfileApiError(
      errorData.message || 'Failed to update profile.',
      response.status
    )
  }

  return response.json()
}

/**
 * Get all user profiles (admin use)
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  const response = await fetch(API_ENDPOINTS.profile.adminList, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new ProfileApiError('Session expired', 401)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new ProfileApiError(
      errorData.message || 'Failed to fetch user profiles.',
      response.status
    )
  }

  return response.json()
}

/**
 * Get a user profile by ID (admin use)
 */
export async function getProfileById(userId: string): Promise<UserProfile> {
  const response = await fetch(API_ENDPOINTS.profile.byId(userId), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new ProfileApiError('Session expired', 401)
    }
    if (response.status === 404) {
      throw new ProfileApiError('User not found', 404)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new ProfileApiError(
      errorData.message || 'Failed to fetch profile.',
      response.status
    )
  }

  return response.json()
}
