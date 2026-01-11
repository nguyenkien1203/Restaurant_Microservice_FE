import { Link } from '@tanstack/react-router'
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderCard } from './order-card'
import type { Order } from '@/lib/types/order'

interface OrderListProps {
  orders: Order[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  /** Show compact cards */
  compact?: boolean
  /** Empty state configuration */
  emptyState?: {
    title?: string
    description?: string
    action?: {
      label: string
      href: string
    }
  }
  /** Custom link builder for order details */
  getDetailsLink?: (order: Order) => string
  /** Limit number of orders shown */
  limit?: number
  /** Title for the section */
  title?: string
}

export function OrderList({
  orders,
  isLoading = false,
  error = null,
  onRetry,
  compact = false,
  emptyState = {
    title: 'No orders yet',
    description: "You haven't placed any orders yet. Start exploring our menu!",
    action: {
      label: 'Browse Menu',
      href: '/menu',
    },
  },
  getDetailsLink,
  limit,
  title,
}: OrderListProps) {
  const displayedOrders = limit ? orders.slice(0, limit) : orders

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        )}
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-destructive">
              Failed to load orders. Please try again.
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        )}
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading orders...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (displayedOrders.length === 0) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        )}
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {emptyState.title}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {emptyState.description}
            </p>
            {emptyState.action && (
              <Link to={emptyState.action.href}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {emptyState.action.label}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Orders list
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      )}
      <div className="space-y-4">
        {displayedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            compact={compact}
            detailsLink={getDetailsLink?.(order)}
          />
        ))}
      </div>
      {limit && orders.length > limit && (
        <div className="text-center pt-2">
          <Link to="/profile" search={{ tab: 'orders' }}>
            <Button variant="outline" size="sm">
              View all {orders.length} orders
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
