import { API_ENDPOINTS } from '../config'
import { triggerSessionExpired } from '../auth-context'

const API_BASE_URL = 'https://au1gqu8qxf.execute-api.us-east-1.amazonaws.com/api'

export interface Table {
    id: number
    tableNumber: string
    capacity: number
    minCapacity: number
    status: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface TimeSlot {
    time: string
    tablesAvailable: number
    availableTables: Table[]
}

export interface AvailabilityResponse {
    date: string
    partySize: number
    availableSlots: TimeSlot[]
}

/**
 * Check availability for a given date and party size
 */
export async function checkAvailability(
    date: string,
    partySize: number
): Promise<AvailabilityResponse> {
    const response = await fetch(
        `${API_BASE_URL}/reservations/availability?date=${date}&partySize=${partySize}`
    )

    if (!response.ok) {
        throw new Error(`Failed to check availability: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Convert 24-hour time format (HH:mm:ss) to 12-hour format (h:mm AM/PM)
 */
export function formatTime24to12(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Convert 12-hour time format to 24-hour format (HH:mm:ss)
 */
export function formatTime12to24(time12: string): string {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return time12

    let hours = parseInt(match[1], 10)
    const minutes = match[2]
    const period = match[3].toUpperCase()

    if (period === 'PM' && hours !== 12) {
        hours += 12
    } else if (period === 'AM' && hours === 12) {
        hours = 0
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`
}

export interface CreateReservationRequest {
    reservationDate: string
    startTime: string
    partySize: number
    specialRequests?: string
    // Guest info (required for guest reservations)
    guestName?: string
    guestEmail?: string
    guestPhone?: string
}

export interface ReservationResponse {
    id: number
    confirmationCode: string
    userId: string | null
    guestName: string | null
    guestEmail: string | null
    guestPhone: string | null
    table: {
        id: number
        tableNumber: string | null
        capacity: number | null
        minCapacity: number | null
        status: string | null
        description: string | null
        isActive: boolean | null
        createdAt: string | null
        updatedAt: string | null
    }
    partySize: number
    reservationDate: string
    startTime: string
    endTime: string
    status: string
    specialRequests: string | null
    preOrderId: number | null
    reminderSent: boolean | null
    createdAt: string
    updatedAt: string
}

/**
 * Create a new reservation for authenticated members
 * Requires authentication (cookies are sent automatically)
 */
export async function createMemberReservation(
    request: CreateReservationRequest
): Promise<ReservationResponse> {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create reservation: ${error || response.statusText}`)
    }

    return response.json()
}

/**
 * Create a new reservation for guests (no authentication required)
 */
export async function createGuestReservation(
    request: CreateReservationRequest
): Promise<ReservationResponse> {
    const response = await fetch(`${API_BASE_URL}/reservations/guest`, {
        method: 'POST',
        // No credentials - don't send cookies for guest reservations
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create reservation: ${error || response.statusText}`)
    }

    return response.json()
}

/**
 * Get the current user's reservations
 */
export async function getMyReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/reservations/my-reservations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch reservations: ${response.statusText}`)
    }

    return response.json()
}



/**
 * Get all reservations (admin only)
 */
export async function getAllReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch reservations: ${response.statusText}`)
    }

    return response.json()
}

export interface UpdateReservationStatusRequest {
    newStatus: string
    reason?: string
}

/**
 * Update reservation status (admin only)
 */
export async function updateReservationStatus(
    reservationId: string | number,
    statusData: UpdateReservationStatusRequest
): Promise<ReservationResponse> {
    const response = await fetch(API_ENDPOINTS.reservation.updateStatus(reservationId), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(statusData),
    })

    if (!response.ok) {
        if (response.status === 401) {
            triggerSessionExpired()
            throw new Error('Session expired')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
            errorData.message || `Failed to update reservation status: ${response.status}`
        )
    }

    return response.json()
}
