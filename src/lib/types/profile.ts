// Profile Types

export type MembershipRank = 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP'

export interface UserProfile {
  id: number
  userId: string
  fullName: string
  phone: string
  email: string
  address: string
  loyaltyPoints: number
  membershipRank: MembershipRank
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  address?: string
}
