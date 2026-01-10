'use client'

import { Minus, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface GuestSelectorProps {
  guests: number
  onGuestsChange: (guests: number) => void
}

export function GuestSelector({ guests, onGuestsChange }: GuestSelectorProps) {
  const minGuests = 1
  const maxGuests = 12

  const handleDecrease = () => {
    if (guests > minGuests) {
      onGuestsChange(guests - 1)
    }
  }

  const handleIncrease = () => {
    if (guests < maxGuests) {
      onGuestsChange(guests + 1)
    }
  }

  return (
    <Card>
      <CardContent className="px-4 flex flex-row justify-between">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              Number of Guests
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            For parties larger than 12, please call us directly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrease}
            disabled={guests <= minGuests}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-semibold text-foreground">
            {guests}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrease}
            disabled={guests >= maxGuests}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
