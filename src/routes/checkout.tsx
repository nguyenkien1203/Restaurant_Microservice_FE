import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Package2,
  Handbag,
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckCircle,
} from 'lucide-react'
import type { OrderType } from '@/components/order/cart-sidebar'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

// Mock cart data - in real app, this would come from global state/context
const mockCartItems = [
  { id: '1', name: 'Grilled Salmon', price: 28.99, quantity: 2 },
  { id: '2', name: 'Caesar Salad', price: 12.99, quantity: 1 },
  { id: '3', name: 'Tiramisu', price: 9.99, quantity: 2 },
]

function CheckoutPage() {
  const navigate = useNavigate()

  // In real app, get this from URL params or global state
  const [orderType] = useState<OrderType>('DELIVERY')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = mockCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const deliveryFee = orderType === 'DELIVERY' ? 5.99 : 0
  const tax = subtotal * 0.1
  const total = subtotal + tax + deliveryFee

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate to order confirmation
    navigate({
      to: '/order-confirmation',
      search: { orderId: `ORD-${Date.now()}` },
    })
  }

  const isDelivery = orderType === 'DELIVERY'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate({ to: '/menu' })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>
          <div className="flex items-center gap-3">
            {isDelivery ? (
              <Package2 className="h-8 w-8 text-primary" />
            ) : (
              <Handbag className="h-8 w-8 text-primary" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">
                {isDelivery ? 'Delivery Order' : 'Takeaway Order'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+61 400 000 000"
                          className="pl-10"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address - Only for delivery */}
              {isDelivery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main Street, Apt 4B"
                        value={formData.address}
                        onChange={handleInputChange}
                        required={isDelivery}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Melbourne"
                          value={formData.city}
                          onChange={handleInputChange}
                          required={isDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          placeholder="3000"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required={isDelivery}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="notes"
                    placeholder={
                      isDelivery
                        ? 'Any delivery instructions? (e.g., ring doorbell, leave at door)'
                        : 'Any special requests for your order?'
                    }
                    className="min-h-[100px]"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Pay on {isDelivery ? 'Delivery' : 'Pickup'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cash or card accepted
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Online payment coming soon. For now, pay when you receive
                    your order.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {mockCartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
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
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      {isDelivery && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Delivery Fee
                          </span>
                          <span className="text-foreground">
                            ${deliveryFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (10%)</span>
                        <span className="text-foreground">
                          ${tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-border text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `Confirm Order • $${total.toFixed(2)}`
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By placing this order, you agree to our terms of service
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
