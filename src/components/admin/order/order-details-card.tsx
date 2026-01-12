import {
  X,
  Package2,
  Handbag,
  Clock,
  UtensilsCrossed,
  User,
  MapPin,
  CreditCard,
  Receipt,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Order, OrderType, OrderStatus } from '@/lib/types/order'
import { StatusUpdateDropdown } from './status-update-dropdown'
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
}: OrderDetailsCardProps) {
  const typeConfig = orderTypeConfig[order.orderType]
  const TypeIcon = typeConfig?.icon || Package2
  const isMemberOrder = !!order.userId
  const [isUserExpanded, setIsUserExpanded] = useState(false)

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

  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  )
  const totalItems = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  )
  // Calculate delivery fee and tax from backend total
  const deliveryFee = order.orderType === 'DELIVERY' ? 5.0 : 0
  const tax = order.totalAmount - subtotal - deliveryFee

  const handleStatusUpdate = async (
    newStatus: OrderStatus,
    reason?: string,
  ) => {
    if (onStatusUpdate) {
      await onStatusUpdate(order.id, newStatus, reason)
    }
  }

  return (
    <Card className="sticky top-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-4 text-lg">
          Order #{order.id}
          <div className="font-normal">
            <StatusUpdateDropdown
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
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
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
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  order.paymentStatus === 'PAID'
                    ? 'border-green-200 text-green-700 bg-green-50'
                    : order.paymentStatus === 'PENDING'
                      ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                      : 'border-red-200 text-red-700 bg-red-50',
                )}
              >
                {order.paymentStatus}
              </Badge>
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
            /* Guest Info (non-member) */
            (order.guestName || order.guestEmail || order.guestPhone) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Guest</h4>
                <div className="grid gap-2">
                  {order.guestName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.guestName}</span>
                    </div>
                  )}
                  {order.guestEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.guestEmail}</span>
                    </div>
                  )}
                  {order.guestPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.guestPhone}</span>
                    </div>
                  )}
                </div>
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
