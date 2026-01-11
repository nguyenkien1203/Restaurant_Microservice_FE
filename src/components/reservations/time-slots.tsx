'use client'

import { Clock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface TimeSlotData {
  time: string
  available: boolean
  tablesAvailable?: number
}

interface TimeSlotsProps {
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  slots?: TimeSlotData[]
  isLoading?: boolean
  hasDateSelected?: boolean
}

// Default time slots when no data is fetched yet
const defaultTimeSlots: TimeSlotData[] = [
  { time: '11:00 AM', available: false },
  { time: '11:30 AM', available: false },
  { time: '12:00 PM', available: false },
  { time: '12:30 PM', available: false },
  { time: '1:00 PM', available: false },
  { time: '1:30 PM', available: false },
  { time: '5:00 PM', available: false },
  { time: '5:30 PM', available: false },
  { time: '6:00 PM', available: false },
  { time: '6:30 PM', available: false },
  { time: '7:00 PM', available: false },
  { time: '7:30 PM', available: false },
  { time: '8:00 PM', available: false },
  { time: '8:30 PM', available: false },
  { time: '9:00 PM', available: false },
]

export function TimeSlots({
  selectedTime,
  onTimeSelect,
  slots,
  isLoading = false,
  hasDateSelected = false
}: TimeSlotsProps) {
  const timeSlots = slots || defaultTimeSlots

  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Select Time</h3>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {!hasDateSelected && (
          <p className="text-sm text-muted-foreground mb-3">
            Please select a date first to see available time slots
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map(({ time, available, tablesAvailable }) => (
            <button
              key={time}
              disabled={!available || isLoading}
              onClick={() => onTimeSelect(time)}
              title={available && tablesAvailable ? `${tablesAvailable} tables available` : undefined}
              className={`
                py-2 px-3 rounded-md text-sm font-medium transition-colors relative
                ${!available || isLoading ? 'bg-muted text-muted-foreground/40 cursor-not-allowed line-through' : 'cursor-pointer'}
                ${available && !isLoading && selectedTime !== time ? 'bg-accent hover:bg-accent/80 text-foreground' : ''}
                ${selectedTime === time ? 'bg-primary text-primary-foreground' : ''}
              `}
            >
              {time}
              {available && tablesAvailable && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {tablesAvailable > 9 ? '9+' : tablesAvailable}
                </span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
