import type { MembershipRank } from '@/lib/types/profile'

export function getMembershipRankBadgeClasses(rank: MembershipRank): string {
    switch (rank) {
        case 'SILVER':
            return 'bg-gray-100 text-gray-700 border-gray-300'
        case 'GOLD':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300'
        case 'PLATINUM':
            return 'bg-purple-100 text-purple-700 border-purple-300'
        case 'VIP':
            return 'bg-amber-100 text-amber-700 border-amber-300'
        default:
            return 'bg-gray-100 text-gray-700 border-gray-300'
    }
}

