"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
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

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              disabled={!date || isPast(date)}
              onClick={() => date && onDateSelect(date)}
              className={`
                h-10 w-full rounded-md text-sm font-medium transition-colors
                ${!date ? "invisible" : ""}
                ${date && isPast(date) ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                ${date && !isPast(date) && !isSelected(date) ? "hover:bg-accent text-foreground" : ""}
                ${date && isSelected(date) ? "bg-primary text-primary-foreground" : ""}
                ${date && isToday(date) && !isSelected(date) ? "border-2 border-primary" : ""}
              `}
            >
              {date?.getDate()}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

