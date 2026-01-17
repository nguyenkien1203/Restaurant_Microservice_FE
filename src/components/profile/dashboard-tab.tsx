import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CalendarX2, UtensilsCrossed, Clock, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderList } from '@/components/order/order-list'
import type { Order } from '@/lib/types/order'
import { getMyReservations, formatTime24to12 } from '@/lib/api/reservation'

interface DashboardTabProps {
  firstName: string
  orders: Order[]
  isOrdersLoading: boolean
  loyaltyPoints?: number
  nextRewardPoints?: number
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function DashboardTab({
  firstName,
  orders,
  isOrdersLoading,
  loyaltyPoints = 0,
  nextRewardPoints = 2000,
}: DashboardTabProps) {
  const progressPercentage = (loyaltyPoints / nextRewardPoints) * 100

  // Fetch reservations
  const {
    data: reservations = [],
    isLoading: isReservationsLoading,
  } = useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: getMyReservations,
    staleTime: 2 * 60 * 1000,
  })

  // Get upcoming reservations (today or later, not cancelled/completed)
  const today = new Date().toISOString().split('T')[0]
  const upcomingReservations = reservations
    .filter(r =>
      r.reservationDate >= today &&
      r.status !== 'CANCELLED' &&
      r.status !== 'COMPLETED' &&
      r.status !== 'NO_SHOW'
    )
    .slice(0, 2) // Show max 2 on dashboard

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's a summary of your account.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Loyalty Points Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Loyalty Points
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-4xl font-bold text-primary">
                  {loyaltyPoints.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-2">points</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Reward</span>
                  <span className="text-muted-foreground">
                    {nextRewardPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  You're {nextRewardPoints - loyaltyPoints} points away from a
                  free dessert!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations Card */}
        <Card>
          <CardContent className="p-4">
            {isReservationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Upcoming Reservations
                  </h3>
                  <Link to="/profile" search={{ tab: 'reservations' }}>
                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          {formatDate(reservation.reservationDate)}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {reservation.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime24to12(reservation.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {reservation.partySize} guests
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarX2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-md mb-1">
                  No upcoming reservations
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Time to plan your next meal?
                </p>
                <div className="flex gap-4">
                  <Link to="/menu">
                    <Button
                      variant="outline"
                      className="text-sm border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <UtensilsCrossed className="h-3 w-3" />
                      Browse Menu
                    </Button>
                  </Link>
                  <Link to="/reservation">
                    <Button className="text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                      <CalendarDays className="h-3 w-3" />
                      Book a Table
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <OrderList
        title="Recent Orders"
        orders={orders}
        isLoading={isOrdersLoading}
        compact
        limit={3}
        getDetailsLink={(order) => `/orders/${order.id}`}
      />
    </div>
  )
}
