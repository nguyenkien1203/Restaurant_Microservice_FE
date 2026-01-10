import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  UtensilsCrossed,
  Package2,
  Handbag,
  Home,
  FileText,
  ChefHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/order-confirmation')({
  component: OrderConfirmationPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: (search.orderId as string) || `ORD-${Date.now()}`,
    }
  },
})

// Mock order data
const mockOrder = {
  id: 'ORD-1704931200',
  type: 'DINE_IN' as const,
  status: 'confirmed',
  items: [
    { id: '1', name: 'Grilled Salmon', price: 28.99, quantity: 2 },
    { id: '2', name: 'Caesar Salad', price: 12.99, quantity: 1 },
    { id: '3', name: 'Tiramisu', price: 9.99, quantity: 2 },
  ],
  subtotal: 90.95,
  tax: 9.1,
  deliveryFee: 0,
  total: 100.05,
  estimatedTime: '25-35',
  tableNumber: 12,
  deliveryAddress: '123 Main Street, Melbourne VIC 3000',
}

const orderTypeConfig = {
  DINE_IN: {
    icon: UtensilsCrossed,
    title: 'Dine In',
    description: 'Your order will be served at your table',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
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

  const config = orderTypeConfig[mockOrder.type]
  const TypeIcon = config.icon

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
            {orderId}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Order Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Order Details
              </h3>

              <div className="space-y-3 mb-4">
                {mockOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${mockOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                {mockOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">
                      ${mockOrder.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="text-foreground">
                    ${mockOrder.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border text-lg">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ${mockOrder.total.toFixed(2)}
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
              onClick={() => navigate({ to: '/menu' })}
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Order More
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate({ to: '/menu' })}
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Complete Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
