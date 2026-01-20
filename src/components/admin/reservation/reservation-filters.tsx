import { useState, useRef, useEffect } from 'react'
import {
  CheckCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from 'lucide-react'
import { cn, APP_TIMEZONE } from '@/lib/utils'
import { FilterDropdown, FilterDropdownHeader } from '../filter-dropdown'
import { SearchInput } from '../search-input'
import { Button } from '@/components/ui/button'
import type { ReservationStatus } from './reservation-row'

export type ReservationStatusFilter = 'all' | ReservationStatus
export type CustomerTypeFilter = 'all' | 'member' | 'guest'

interface ReservationFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: ReservationStatusFilter
  onStatusChange: (status: ReservationStatusFilter) => void
  dateFilter: string
  onDateChange: (date: string) => void
  customerTypeFilter: CustomerTypeFilter
  onCustomerTypeChange: (type: CustomerTypeFilter) => void
}

const reservationStatusConfig: Record<
  ReservationStatus,
  { label: string; color: string }
> = {
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
  customerTypeFilter,
  onCustomerTypeChange,
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
              ...Object.entries(reservationStatusConfig).map(
                ([value, config]) => ({
                  value,
                  label: config.label,
                  color: config.color,
                }),
              ),
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

        {/* Customer Type Filter */}
        <FilterDropdown
          label="Customer"
          icon={<User className="h-4 w-4" />}
          hasActiveFilters={customerTypeFilter !== 'all'}
        >
          <FilterDropdownHeader>Customer Type</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Customers' },
              { value: 'member', label: 'Member' },
              { value: 'guest', label: 'Guest' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onCustomerTypeChange(option.value as CustomerTypeFilter)
                }
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  customerTypeFilter === option.value && 'bg-accent',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Date Filter */}
        <DateFilterDropdown
          dateFilter={dateFilter}
          onDateChange={onDateChange}
        />
      </div>
    </div>
  )
}

// Custom Date Filter Dropdown Component
interface DateFilterDropdownProps {
  dateFilter: string
  onDateChange: (date: string) => void
}

function DateFilterDropdown({
  dateFilter,
  onDateChange,
}: DateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: APP_TIMEZONE,
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    if (!dateFilter) return false
    const selectedDate = new Date(dateFilter)
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    onDateChange(`${year}-${month}-${day}`)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange('')
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap cursor-pointer',
          dateFilter
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-card text-foreground hover:bg-accent',
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0" />
        <span className="min-w-[100px] text-left">
          {formatDateDisplay(dateFilter)}
        </span>
        {dateFilter && (
          <>
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <X
              className="h-3 w-3 shrink-0 opacity-60 hover:opacity-100"
              onClick={handleClear}
            />
          </>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[280px] bg-card border border-border rounded-lg shadow-lg z-50 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">
                {currentMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                  timeZone: APP_TIMEZONE,
                })}
              </h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                disabled={!date}
                onClick={() => date && handleDateSelect(date)}
                className={cn(
                  'h-8 w-full rounded-md text-xs font-medium transition-colors',
                  !date && 'invisible',
                  date &&
                    isSelected(date) &&
                    'bg-primary text-primary-foreground',
                  date &&
                    !isSelected(date) &&
                    isToday(date) &&
                    'border-2 border-primary text-foreground hover:bg-accent',
                  date &&
                    !isSelected(date) &&
                    !isToday(date) &&
                    'text-foreground hover:bg-accent',
                )}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
            <button
              onClick={() => {
                const today = new Date()
                handleDateSelect(today)
              }}
              className="text-xs text-primary hover:underline"
            >
              Today
            </button>
            {dateFilter && (
              <button
                onClick={handleClear}
                className="text-xs text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
