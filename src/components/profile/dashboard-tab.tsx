import { Link } from '@tanstack/react-router'
import { CalendarDays, CalendarX2, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderList } from '@/components/order/order-list'
import type { Order } from '@/lib/types/order'

interface DashboardTabProps {
  firstName: string
  orders: Order[]
  isOrdersLoading: boolean
  loyaltyPoints?: number
  nextRewardPoints?: number
}

export function DashboardTab({
  firstName,
  orders,
  isOrdersLoading,
  loyaltyPoints = 0,
  nextRewardPoints = 2000,
}: DashboardTabProps) {
  const progressPercentage = (loyaltyPoints / nextRewardPoints) * 100

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
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarX2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No upcoming reservations
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have any tables booked at the moment. Time to plan your
              next delicious meal?
            </p>
            <div className="flex gap-6">
              <Link to="/menu">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Explore our Menu
                </Button>
              </Link>
              <Link to="/reservation">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <CalendarDays className="h-4 w-4" />
                  Book a Table
                </Button>
              </Link>
            </div>
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
