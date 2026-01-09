"use client"

import { Card, CardContent } from "@/components/ui/card"

interface TimeSlotsProps {
  selectedTime: string | null
  onTimeSelect: (time: string) => void
}

const timeSlots = [
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: false },
  { time: "1:00 PM", available: true },
  { time: "1:30 PM", available: true },
  { time: "5:00 PM", available: true },
  { time: "5:30 PM", available: true },
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: false },
  { time: "7:00 PM", available: true },
  { time: "7:30 PM", available: true },
  { time: "8:00 PM", available: true },
  { time: "8:30 PM", available: true },
  { time: "9:00 PM", available: true },
]

export function TimeSlots({ selectedTime, onTimeSelect }: TimeSlotsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Select Time</h3>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map(({ time, available }) => (
            <button
              key={time}
              disabled={!available}
              onClick={() => onTimeSelect(time)}
              className={`
                py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${!available ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through" : "cursor-pointer"}
                ${available && selectedTime !== time ? "bg-accent hover:bg-accent/80 text-foreground" : ""}
                ${selectedTime === time ? "bg-primary text-primary-foreground" : ""}
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

