import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MembershipRank } from './types/profile'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Application timezone - UTC+7 (Asia/Bangkok)
 */
export const APP_TIMEZONE = 'Asia/Bangkok'

/**
 * Get today's date string (YYYY-MM-DD) in UTC+7 timezone
 * This ensures date comparisons are done in the application's timezone
 */
export function getTodayInAppTimezone(): string {
  const now = new Date()
  // Format current time in UTC+7 to get the date string (YYYY-MM-DD)
  return now.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE }) // en-CA gives YYYY-MM-DD format
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
