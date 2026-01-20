import { API_ENDPOINTS } from '@/lib/config'
import type { Table } from '@/lib/types/table'
import { triggerSessionExpired } from '@/lib/auth-context'

/**
 * Get all tables (admin only)
 */
export async function getAllTables(): Promise<Table[]> {
    const response = await fetch(API_ENDPOINTS.table.all, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })

    if (!response.ok) {
        if (response.status === 401) {
            triggerSessionExpired()
            throw new Error('Session expired')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
            errorData.message || `Failed to fetch tables: ${response.status}`
        )
    }

    return response.json()
}
