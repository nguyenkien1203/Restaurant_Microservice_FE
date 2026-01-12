import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    FilterDropdown,
    FilterDropdownHeader,
} from '../filter-dropdown'
import { SearchInput } from '../search-input'
import type { ReservationStatus } from './reservation-row'

export type ReservationStatusFilter = 'all' | ReservationStatus

interface ReservationFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: ReservationStatusFilter
    onStatusChange: (status: ReservationStatusFilter) => void
    dateFilter: string
    onDateChange: (date: string) => void
}

const reservationStatusConfig: Record<ReservationStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-500' },
    CONFIRMED: { label: 'Confirmed', color: 'bg-green-500' },
    SEATED: { label: 'Seated', color: 'bg-blue-500' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-500' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-500' },
    NO_SHOW: { label: 'No Show', color: 'bg-red-500' },
}

export function ReservationFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    dateFilter,
    onDateChange,
}: ReservationFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search by confirmation code, guest name..."
            />

            <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <FilterDropdown
                    label="Status"
                    icon={<CheckCircle className="h-4 w-4" />}
                    hasActiveFilters={statusFilter !== 'all'}
                >
                    <FilterDropdownHeader>Reservation Status</FilterDropdownHeader>
                    <div>
                        {[
                            { value: 'all', label: 'All Statuses', color: 'bg-primary' },
                            ...Object.entries(reservationStatusConfig).map(([value, config]) => ({
                                value,
                                label: config.label,
                                color: config.color,
                            })),
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() =>
                                    onStatusChange(option.value as ReservationStatusFilter)
                                }
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                                    statusFilter === option.value && 'bg-accent',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-2 w-2 rounded-full',
                                        statusFilter === option.value
                                            ? option.color
                                            : 'bg-transparent border border-border',
                                    )}
                                />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </FilterDropdown>

                {/* Date Filter */}
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm h-9"
                />
            </div>
        </div>
    )
}
