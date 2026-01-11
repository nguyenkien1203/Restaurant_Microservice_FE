import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  Mail,
  Clock,
  Pencil,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react'
import type { OrderType, CartItem } from '@/components/order/cart-sidebar'
import {
  getCartFromStorage,
  getOrderTypeFromStorage,
  clearCartStorage,
} from '@/components/order/cart-sidebar'
import { useAuth } from '@/lib/auth-context'
import type { UserProfile } from '@/lib/types/profile'
import { getMyProfile } from '@/lib/api/profile'
import { createMemberOrder, createPreOrder } from '@/lib/api/order'
import type {
  CreateMemberOrderRequest,
  CreateOrderItemRequest,
  CreatePreOrderRequest,
} from '@/lib/types/order'

interface CheckoutSearchParams {
  reservationId?: string
}

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>): CheckoutSearchParams => {
    return {
      reservationId: search.reservationId as string | undefined,
    }
  },
})

function CheckoutPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/checkout' })
  const reservationId = search.reservationId

  const { isAuthenticated, user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>('TAKEAWAY')

  // Load cart and order type from localStorage on mount
  useEffect(() => {
    const storedCart = getCartFromStorage()
    const storedOrderType = getOrderTypeFromStorage()

    if (storedCart.length > 0) {
      setCartItems(storedCart)
    } else {
      // If no cart items, redirect back to menu
      navigate({ to: '/menu' })
      return
    }

    if (storedOrderType) {
      setOrderType(storedOrderType)
    }
  }, [navigate])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })
  // Fetch user profile if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getMyProfile()
        .then((profile) => {
          setUserProfile(profile)

          setFormData({
            fullName: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            notes: '',
          })
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err)
        })
    }
  }, [isAuthenticated])

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = cartItems.reduce(
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
    setError(null)

    if (cartItems.length === 0) {
      navigate({ to: '/menu' })
      return
    }

    // For now, only authenticated users can create orders via memberCreate endpoint
    if (!isAuthenticated) {
      setError('Please log in to place an order. Guest checkout coming soon!')
      return
    }

    setIsProcessing(true)

    try {
      // Build order items from cart
      const orderItems: CreateOrderItemRequest[] = cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes || undefined,
      }))

      let createdOrder

      // Check if this is a pre-order (has reservationId and is PRE_ORDER type)
      if (orderType === 'PRE_ORDER' && reservationId) {
        // Build pre-order request
        const preOrderRequest: CreatePreOrderRequest = {
          items: orderItems,
          paymentMethod: 'CASH',
          notes: formData.notes || undefined,
        }

        createdOrder = await createPreOrder(reservationId, preOrderRequest)
      } else {
        // Build the regular order request
        const orderRequest: CreateMemberOrderRequest = {
          orderType: orderType,
          items: orderItems,
          paymentMethod: 'CASH', // Currently only CASH is supported
          notes: formData.notes || undefined,
        }

        // Add delivery address for delivery orders
        if (orderType === 'DELIVERY' && formData.address) {
          orderRequest.deliveryAddress = formData.address
        }

        createdOrder = await createMemberOrder(orderRequest)
      }

      // Clear cart after successful order
      clearCartStorage()

      // Navigate to order confirmation with the actual order ID
      navigate({
        to: '/order-confirmation',
        search: { orderId: String(createdOrder.id) },
      })
    } catch (err) {
      console.error('Failed to create order:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create order. Please try again.',
      )
      setIsProcessing(false)
    }
  }

  const isDelivery = orderType === 'DELIVERY'
  const isTakeaway = orderType === 'TAKEAWAY'
  const isPreOrder = orderType === 'PRE_ORDER'

  const getOrderTypeLabel = () => {
    if (isPreOrder) return 'Pre-order for Reservation'
    if (isDelivery) return 'Delivery Order'
    return 'Takeaway Order'
  }

  const getOrderTypeIcon = () => {
    if (isPreOrder) return <CalendarCheck className="h-8 w-8 text-primary" />
    if (isDelivery) return <Package2 className="h-8 w-8 text-primary" />
    return <Handbag className="h-8 w-8 text-primary" />
  }

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
            {getOrderTypeIcon()}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">
                {getOrderTypeLabel()}
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
              {/* Contact Information & Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="grid grid-cols-2 gap-2 text-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Information
                    </div>
                    {isDelivery && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Delivery Address</span>
                      </div>
                    )}
                    {isTakeaway && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Pickup Time</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Column - Contact Information */}
                    <div className="flex flex-col gap-4">
                      {isAuthenticated ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Name
                              </p>
                              <p className="text-md text-foreground font-medium">
                                {user?.fullName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Phone
                              </p>
                              <p className="text-md text-foreground font-medium">
                                {userProfile?.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Email
                              </p>
                              <p className="text-md text-foreground font-medium">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              placeholder="John Doe"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              disabled={isAuthenticated}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
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
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Delivery Address (only for delivery) */}
                    {isDelivery && (
                      <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            placeholder="123 Main Street, Apt 4B"
                            value={formData.address}
                            onChange={handleInputChange}
                            required={isDelivery}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pencil className="h-5 w-5 text-primary" />
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
                          {isPreOrder ? 'Pay at Restaurant' : isDelivery ? 'Pay on Delivery' : 'Pay on Pickup'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cash or card accepted
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {isPreOrder
                      ? 'Your pre-order will be ready when you arrive for your reservation.'
                      : 'Online payment coming soon. For now, pay when you receive your order.'
                    }
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
                      {cartItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No items in cart
                        </p>
                      ) : (
                        cartItems.map((item) => (
                          <div key={item.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground italic pl-1">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                        ))
                      )}
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

                    {error && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isProcessing || cartItems.length === 0}
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
