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

export interface UpdateReservationStatusRequest {
  newStatus: string
  reason?: string
}
