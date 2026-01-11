import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Package2,
  Handbag,
  Clock,
  MapPin,
  CreditCard,
  Receipt,
  Loader2,
  AlertCircle,
  Home,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { getOrderById } from '@/lib/api/order'
import { cn } from '@/lib/utils'
import type { OrderType } from '@/lib/types/order'

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailsPage,
})

const orderTypeConfig: Record<
  OrderType,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  DELIVERY: {
    icon: Package2,
    label: 'Delivery',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  TAKEAWAY: {
    icon: Handbag,
    label: 'Takeaway',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  PRE_ORDER: {
    icon: Clock,
    label: 'Pre-Order',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
}

function formatDate(dateString?: string) {
  if (!dateString) return 'Date unavailable'
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function OrderDetailsPage() {
  const navigate = useNavigate()
  const { orderId } = Route.useParams()

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    retry: 1,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() =>
              navigate({ to: '/profile', search: { tab: 'orders' } })
            }
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

          <div className="max-w-lg mx-auto text-center py-12">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Order
            </h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'Order not found'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() =>
                  navigate({ to: '/profile', search: { tab: 'orders' } })
                }
              >
                View All Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const typeConfig = orderTypeConfig[order.orderType]
  const TypeIcon = typeConfig?.icon || Package2
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  )
  // Calculate delivery fee and tax from backend total
  const deliveryFee = order.orderType === 'DELIVERY' ? 5.0 : 0
  const tax = order.totalAmount - subtotal - deliveryFee

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() =>
              navigate({ to: '/profile', search: { tab: 'orders' } })
            }
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'h-14 w-14 rounded-xl flex items-center justify-center',
                  typeConfig?.bgColor || 'bg-gray-100',
                )}
              >
                <TypeIcon
                  className={cn(
                    'h-7 w-7',
                    typeConfig?.color || 'text-gray-600',
                  )}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Order #{order.id}
                </h1>
                <p className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Order Type Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center',
                    typeConfig?.bgColor || 'bg-gray-100',
                  )}
                >
                  <TypeIcon
                    className={cn(
                      'h-6 w-6',
                      typeConfig?.color || 'text-gray-600',
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {typeConfig?.label || order.orderType} Order
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.orderType === 'DELIVERY'
                      ? 'Your order will be delivered to your address'
                      : order.orderType === 'TAKEAWAY'
                        ? 'Pick up your order when ready'
                        : 'Your order will be ready at your scheduled time'}
                  </p>
                </div>
              </div>
              
              {/* Estimated Pickup Time */}
              {order.estimatedPickupTime && (
                <div className="mt-4 pt-4 border-t border-border flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Estimated Pickup Time
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.estimatedPickupTime)}
                    </p>
                  </div>
                </div>
              )}  

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="mt-4 pt-4 border-t border-border flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Delivery Address
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Special Instructions
                  </p>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Order Items
              </h3>

              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {item.quantity}×
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {item.menuItemName}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium text-foreground">
                    {order.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <p
                    className={cn(
                      'font-medium',
                      order.paymentStatus === 'PAID'
                        ? 'text-green-600'
                        : order.paymentStatus === 'PENDING'
                          ? 'text-yellow-600'
                          : 'text-red-600',
                    )}
                  >
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: '/' })}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Link to="/menu" className="flex-1">
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Order Again
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
