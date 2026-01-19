import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MembershipRank } from './types/profile'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get discount percentage based on membership rank
 * SILVER -> 5% discount
 * GOLD -> 10% discount
 * PLATINUM -> 15% discount
 * VIP -> 20% discount
 */
export function getDiscountPercentage(membershipRank?: MembershipRank): number {
  switch (membershipRank) {
    case 'SILVER':
      return 5
    case 'GOLD':
      return 10
    case 'PLATINUM':
      return 15
    case 'VIP':
      return 20
    default:
      return 0
  }
}
