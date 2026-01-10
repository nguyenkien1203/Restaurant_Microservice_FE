// Profile Types

export interface UserProfile {
  id: number
  userId: string
  fullName: string
  phone: string
  email: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  address?: string
}
