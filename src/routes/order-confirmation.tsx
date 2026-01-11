import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  MapPin,
  UtensilsCrossed,
  Package2,
  Handbag,
  FileText,
  AlertCircle,
  Loader2,
  ClipboardList,
} from 'lucide-react'
import { getOrderById } from '@/lib/api/order'
import type { Order, OrderType } from '@/lib/types/order'

export const Route = createFileRoute('/order-confirmation')({
  component: OrderConfirmationPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: (search.orderId as string) || '',
    }
  },
})

const orderTypeConfig: Record<
  OrderType,
  {
    icon: typeof Package2
    title: string
    description: string
    color: string
    bgColor: string
  }
> = {
  TAKEAWAY: {
    icon: Handbag,
    title: 'Takeaway',
    description: 'Pick up your order when ready',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  DELIVERY: {
    icon: Package2,
    title: 'Delivery',
    description: 'Your order will be delivered to your address',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  PRE_ORDER: {
    icon: Clock,
    title: 'Pre-Order',
    description: 'Your order will be ready at your scheduled time',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
}

function OrderConfirmationPage() {
  const navigate = useNavigate()
  const { orderId } = Route.useSearch()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setIsLoading(false)
      return
    }

    getOrderById(orderId)
      .then((fetchedOrder) => {
        setOrder(fetchedOrder)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch order:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load order details',
        )
        setIsLoading(false)
      })
  }, [orderId])

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Unable to Load Order
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || 'Order not found'}
          </p>
          <Button onClick={() => navigate({ to: '/menu' })}>
            Return to Menu
          </Button>
        </div>
      </div>
    )
  }

  const config = orderTypeConfig[order.orderType]
  const TypeIcon = config?.icon || Package2

  // Calculate subtotal from order items
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  )
  // Calculate delivery fee and tax from backend total
  const deliveryFee = order.orderType === 'DELIVERY' ? 5.0 : 0
  const tax = order.totalAmount - subtotal - deliveryFee

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-4">
          Thank you for your order. We've received it and are getting it ready.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-mono font-semibold text-foreground">
            #{order.id}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Order Type & Status */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full ${config?.bgColor || 'bg-primary/10'} flex items-center justify-center`}
                >
                  <TypeIcon
                    className={`h-6 w-6 ${config?.color || 'text-primary'}`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {config?.title || order.orderType}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {config?.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Estimated Pickup Time for Takeaway Orders */}
              {order.orderType === 'TAKEAWAY' && order.estimatedPickupTime && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Estimated Pickup Time
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.estimatedPickupTime).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Bangkok', // UTC+7
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
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
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Special Instructions
                  </p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Order Details
              </h3>

              <div className="space-y-3 mb-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-foreground">
                        {item.quantity}x {item.menuItemName}
                      </span>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-foreground ml-4">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-border text-lg">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="text-foreground">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span
                    className={
                      order.paymentStatus === 'PAID'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigate({ to: '/profile', search: { tab: 'orders' } })
              }
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              View Order History
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate({ to: '/menu' })}
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Make New Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
