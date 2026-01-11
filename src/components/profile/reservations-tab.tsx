import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarX2, CalendarDays, Clock, Users, MapPin, Loader2, AlertCircle, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMyReservations, formatTime24to12, type ReservationResponse } from '@/lib/api/reservation'

// Status badge colors
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  SEATED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface ReservationCardProps {
  reservation: ReservationResponse
}

function ReservationCard({ reservation }: ReservationCardProps) {
  const statusClass = statusColors[reservation.status] || statusColors.PENDING

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Details */}
          <div className="flex-1 space-y-3">
            {/* Date and Time */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatDate(reservation.reservationDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime24to12(reservation.startTime)} - {formatTime24to12(reservation.endTime)}</span>
              </div>
            </div>

            {/* Party size and Table */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}</span>
              </div>
              {reservation.table?.tableNumber && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Table {reservation.table.tableNumber}</span>
                </div>
              )}
            </div>

            {/* Special Requests */}
            {reservation.specialRequests && (
              <p className="text-sm text-muted-foreground italic">
                "{reservation.specialRequests}"
              </p>
            )}

            {/* Confirmation Code */}
            <p className="text-xs text-muted-foreground">
              Confirmation: <span className="font-mono font-medium text-primary">{reservation.confirmationCode}</span>
            </p>
          </div>

          {/* Right side - Status and Actions */}
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
              {reservation.status}
            </span>

            {/* Pre-order button for upcoming reservations */}
            {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && !reservation.preOrderId && (
              <Link to="/menu" search={{ reservationId: String(reservation.id) }}>
                <Button variant="outline" size="sm" className="text-xs">
                  <UtensilsCrossed className="h-3 w-3 mr-1" />
                  Pre-order
                </Button>
              </Link>
            )}

            {reservation.preOrderId && (
              <Link to="/orders/$orderId" params={{ orderId: String(reservation.preOrderId) }}>
                <span className="text-xs text-green-600 font-medium hover:underline cursor-pointer">
                  Pre-order placed →
                </span>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReservationsTab() {
  const {
    data: reservations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: getMyReservations,
    staleTime: 2 * 60 * 1000,
  })

  // Separate upcoming and past reservations
  const today = new Date().toISOString().split('T')[0]
  const upcomingReservations = reservations.filter(r =>
    r.reservationDate >= today && r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && r.status !== 'NO_SHOW'
  )
  const pastReservations = reservations.filter(r =>
    r.reservationDate < today || r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'NO_SHOW'
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          My Reservations
        </h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          My Reservations
        </h1>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Failed to load reservations
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (reservations.length === 0) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          My Reservations
        </h1>
        <Link to="/reservation">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <CalendarDays className="h-4 w-4 mr-2" />
            Book a Table
          </Button>
        </Link>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
          <div className="space-y-3">
            {upcomingReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Past Reservations</h2>
          <div className="space-y-3 opacity-75">
            {pastReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
