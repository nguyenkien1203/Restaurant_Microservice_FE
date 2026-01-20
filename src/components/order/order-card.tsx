import { Link } from '@tanstack/react-router'
import {
  Package2,
  Handbag,
  Clock,
  UtensilsCrossed,
  MapPin,
  CreditCard,
  ChevronRight,
  Receipt,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from './order-status-badge'
import { cn, APP_TIMEZONE } from '@/lib/utils'
import type { Order, OrderType } from '@/lib/types/order'

interface OrderCardProps {
  order: Order
  /** Compact mode for dashboard/recent orders */
  compact?: boolean
  /** Custom action buttons */
  actions?: React.ReactNode
  /** Link to order details (defaults to /orders/:id) */
  detailsLink?: string
}

const orderTypeConfig: Record<
  OrderType,
  { icon: React.ElementType; label: string; color: string }
> = {
  DELIVERY: {
    icon: Package2,
    label: 'Delivery',
    color: 'text-green-600 bg-green-100',
  },
  TAKEAWAY: {
    icon: Handbag,
    label: 'Takeaway',
    color: 'text-orange-600 bg-orange-100',
  },
  PRE_ORDER: {
    icon: Clock,
    label: 'Pre-Order',
    color: 'text-purple-600 bg-purple-100',
  },
  DINE_IN: {
    icon: UtensilsCrossed,
    label: 'Dine In',
    color: 'text-blue-600 bg-blue-100',
  },
}

function formatDate(dateString?: string, includeTime = false) {
  if (!dateString) return 'Date unavailable'
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: APP_TIMEZONE,
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return date.toLocaleDateString('en-US', options)
}

export function OrderCard({
  order,
  compact = false,
  actions,
  detailsLink,
}: OrderCardProps) {
  const typeConfig = orderTypeConfig[order.orderType]
  const TypeIcon = typeConfig?.icon || Package2
  const link = detailsLink || `/orders/${order.id}`

  if (compact) {
    return (
      <Link to={link} className="block group hover:shadow-md transition-shadow">
        <Card className="cursor-pointer">
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Order Type Icon */}
              <div
                className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                  typeConfig?.color || 'text-gray-600 bg-gray-100',
                )}
              >
                <TypeIcon className="h-6 w-6" />
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {typeConfig?.label || order.orderType} Order #{order.id}
                  </h3>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)} • {order.orderItems.length} item
                  {order.orderItems.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Total & Action */}
              <div className="text-right shrink-0 flex items-center gap-2">
                <p className="font-semibold text-primary text-lg">
                  ${order.totalAmount.toFixed(2)}
                </p>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Full order card
  return (
    <Link
      to={link}
      className="block hover:shadow-md transition-shadow"
      onClick={(e) => {
        // Prevent navigation if clicking on custom actions
        if (
          actions &&
          (e.target as HTMLElement).closest('[data-order-action]')
        ) {
          e.preventDefault()
        }
      }}
    >
      <Card className="overflow-hidden cursor-pointer py-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                typeConfig?.color || 'text-gray-600 bg-gray-100',
              )}
            >
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  Order #{order.id}
                </h3>
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full border border-border">
                  {typeConfig?.label || order.orderType}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt, true)}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <CardContent className="p-5 pt-0">
          {/* Order Items */}
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Items
            </h4>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              {order.orderItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    <span className="text-muted-foreground mr-1">
                      {item.quantity}×
                    </span>
                    {item.menuItemName}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
              {order.orderItems.length > 3 && (
                <p className="text-xs text-muted-foreground pt-1">
                  +{order.orderItems.length - 3} more item
                  {order.orderItems.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {/* Payment */}
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Payment</p>
                <p className="text-foreground font-medium">
                  {order.paymentMethod}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    order.paymentStatus === 'PAID'
                      ? 'text-green-600'
                      : 'text-yellow-600',
                  )}
                >
                  {order.paymentStatus}
                </p>
              </div>
            </div>

            {/* Estimated Pickup Time */}
            {order.estimatedPickupTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Estimated Pickup Time</p>
                  <p className="text-foreground font-medium">
                    {formatDate(order.estimatedPickupTime, true)}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Delivery to</p>
                  <p className="text-foreground font-medium line-clamp-2">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700 font-medium mb-1">
                Special Instructions
              </p>
              <p className="text-sm text-amber-800">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>

            {actions ? (
              <div data-order-action onClick={(e) => e.stopPropagation()}>
                {actions}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                View Details
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
