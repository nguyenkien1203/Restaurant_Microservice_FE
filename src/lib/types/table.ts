export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'

export interface Table {
    id: number
    tableNumber: string
    capacity: number
    minCapacity: number
    status: TableStatus
    description: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}
