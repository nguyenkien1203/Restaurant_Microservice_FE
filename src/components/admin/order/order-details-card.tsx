import {
  X,
  Package2,
  Handbag,
  Clock,
  UtensilsCrossed,
  User,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
  CalendarCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  Order,
  OrderType,
  OrderStatus,
  PaymentStatus,
} from '@/lib/types/order'
import {
  OrderStatusDropdown,
  PaymentStatusDropdown,
} from './status-update-dropdown'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProfileById } from '@/lib/api/profile'

interface OrderDetailsCardProps {
  order: Order
  onClose: () => void
  onStatusUpdate?: (
    orderId: number,
    newStatus: OrderStatus,
    reason?: string,
  ) => Promise<void>
  isUpdatingStatus?: boolean
  onPaymentStatusUpdate?: (
    orderId: number,
    newStatus: PaymentStatus,
  ) => Promise<void>
  isUpdatingPaymentStatus?: boolean
}

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
  DINE_IN: {
    icon: UtensilsCrossed,
    label: 'Dine In',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateString?: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderDetailsCard({
  order,
  onClose,
  onStatusUpdate,
  isUpdatingStatus = false,
  onPaymentStatusUpdate,
  isUpdatingPaymentStatus = false,
}: OrderDetailsCardProps) {
  const typeConfig = orderTypeConfig[order.orderType]
  const TypeIcon = typeConfig?.icon || Package2
  const isMemberOrder = !!order.userId
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const [isGuestExpanded, setIsGuestExpanded] = useState(false)

  // Fetch user profile when expanded (for member orders)
  const {
    data: userProfile,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['profile', order.userId],
    queryFn: () => getProfileById(order.userId!),
    enabled: !!order.userId && isUserExpanded,
  })

  const totalItems = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  )
  // Use values directly from backend
  const subtotal = order.subtotal
  const tax = order.taxAmount
  const deliveryFee = order.deliveryFee
  const discountAmount = order.discountAmount ?? 0
  const discountPercentage = order.discountPercentage ?? 0

  const handleStatusUpdate = async (
    newStatus: OrderStatus,
    reason?: string,
  ) => {
    if (onStatusUpdate) {
      await onStatusUpdate(order.id, newStatus, reason)
    }
  }

  const handlePaymentStatusUpdate = async (newStatus: PaymentStatus) => {
    if (onPaymentStatusUpdate) {
      await onPaymentStatusUpdate(order.id, newStatus)
    }
  }

  return (
    <Card className="sticky top-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-4 text-lg">
          Order #{order.id}
          <div className="font-normal">
            <OrderStatusDropdown
              currentStatus={order.status}
              onStatusUpdate={handleStatusUpdate}
              isUpdatingStatus={isUpdatingStatus}
            />
          </div>
        </CardTitle>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Type */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Order Type</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <TypeIcon
                className={cn('h-4 w-4', typeConfig?.color || 'text-gray-600')}
              />
              <span>{typeConfig?.label || order.orderType}</span>
            </div>
          </div>
        </div>

        {/* Reservation ID - Only for Pre-Orders */}
        {order.orderType === 'PRE_ORDER' && order.reservationId && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Reservation ID
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              <span>Reservation #{order.reservationId}</span>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Delivery Address
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{order.deliveryAddress}</span>
            </div>
          </div>
        )}

        {/* Estimated Pickup Time */}
        {order.estimatedPickupTime && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Estimated Pickup Time
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(order.estimatedPickupTime)}</span>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Order Items ({totalItems})
          </h3>
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                  {item.quantity}×
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {item.menuItemName}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Note: {item.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-foreground shrink-0">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                Member Discount
                {discountPercentage > 0 && ` (${discountPercentage.toFixed(0)}%)`}
                {order.membershipRank && ` - ${order.membershipRank}`}
              </span>
              <span className="font-medium">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between items-center my-2 pt-2 border-t border-border text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span className="text-foreground">Total</span>
            <span className="text-primary">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Payment Information
          </h4>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{order.paymentMethod}</span>
            </div>
            <div
              className="flex items-center gap-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <PaymentStatusDropdown
                currentStatus={order.paymentStatus}
                onStatusUpdate={handlePaymentStatusUpdate}
                isUpdatingStatus={isUpdatingPaymentStatus}
              />
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Party Information
          </h4>
          {/* Member Order - Expandable */}
          {isMemberOrder ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setIsUserExpanded(!isUserExpanded)}
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Member User
                </span>
                {isUserExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {isUserExpanded && (
                <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                  {isLoadingUser ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : userError ? (
                    <p className="text-sm text-destructive">
                      Failed to load user details
                    </p>
                  ) : userProfile ? (
                    <>
                      {/* User Name */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {userProfile.fullName}
                        </span>
                      </div>

                      {/* Email */}
                      {userProfile.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userProfile.email}</span>
                        </div>
                      )}

                      {/* Phone */}
                      {userProfile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userProfile.phone}</span>
                        </div>
                      )}

                      {/* Address */}
                      {userProfile.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userProfile.address}</span>
                        </div>
                      )}

                      {/* User ID */}
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          User ID: {order.userId}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            /* Guest Info (non-member) - Expandable */
            (order.guestName || order.guestEmail || order.guestPhone) && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => setIsGuestExpanded(!isGuestExpanded)}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Guest
                  </span>
                  {isGuestExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {isGuestExpanded && (
                  <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                    {/* Guest Name */}
                    {order.guestName && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {order.guestName}
                        </span>
                      </div>
                    )}

                    {/* Email */}
                    {order.guestEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.guestEmail}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {order.guestPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.guestPhone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Special Instructions
            </h4>
            <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
              "{order.notes}"
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          {order.createdAt && <p>Created: {formatDateTime(order.createdAt)}</p>}
          {order.updatedAt && <p>Updated: {formatDateTime(order.updatedAt)}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
