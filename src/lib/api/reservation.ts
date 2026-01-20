import { API_ENDPOINTS } from '../config'
import { triggerSessionExpired } from '../auth-context'
import type {
    AvailabilityResponse,
    CreateReservationRequest,
    ReservationResponse,
    UpdateReservationStatusRequest,
} from '../types/reservation'

/**
 * Check availability for a given date and party size
 */
export async function checkAvailability(
    date: string,
    partySize: number,
): Promise<AvailabilityResponse> {
    const response = await fetch(
        API_ENDPOINTS.reservation.availability(date, partySize),
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


/**
 * Create a new reservation for authenticated members
 * Requires authentication (cookies are sent automatically)
 */
export async function createMemberReservation(
    request: CreateReservationRequest,
): Promise<ReservationResponse> {
    const response = await fetch(API_ENDPOINTS.reservation.create, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(
            `Failed to create reservation: ${error || response.statusText}`,
        )
    }

    return response.json()
}

/**
 * Create a new reservation for guests (no authentication required)
 */
export async function createGuestReservation(
    request: CreateReservationRequest,
): Promise<ReservationResponse> {
    const response = await fetch(API_ENDPOINTS.reservation.createGuest, {
        method: 'POST',
        // No credentials - don't send cookies for guest reservations
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(
            `Failed to create reservation: ${error || response.statusText}`,
        )
    }

    return response.json()
}

/**
 * Get the current user's reservations
 */
export async function getMyReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(API_ENDPOINTS.reservation.myReservations, {
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
 * Get public reservation details by ID
 * This endpoint does not require authentication
 */
export async function getPublicReservation(
    reservationId: string | number,
): Promise<ReservationResponse> {
    const response = await fetch(
        API_ENDPOINTS.reservation.public(reservationId),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    )

    if (!response.ok) {
        throw new Error(`Failed to fetch reservation: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Get all reservations (admin only)
 */
export async function getAllReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(API_ENDPOINTS.reservation.admin, {
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
 * Update reservation status (admin only)
 */
export async function updateReservationStatus(
    reservationId: string | number,
    statusData: UpdateReservationStatusRequest,
): Promise<ReservationResponse> {
    const response = await fetch(
        API_ENDPOINTS.reservation.updateStatus(reservationId),
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(statusData),
        },
    )

    if (!response.ok) {
        if (response.status === 401) {
            triggerSessionExpired()
            throw new Error('Session expired')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
            errorData.message ||
            `Failed to update reservation status: ${response.status}`,
        )
    }

    return response.json()
}
