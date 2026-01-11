import { Link } from '@tanstack/react-router'
import { CalendarX2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ReservationsTab() {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
        My Reservations
      </h1>
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarX2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No reservations found
          </h3>
          <p className="text-muted-foreground mb-6">
            You haven't made any reservations yet.
          </p>
          <Link to="/reservation">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Book a Table
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
