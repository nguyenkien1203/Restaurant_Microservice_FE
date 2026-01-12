import {
  X,
  Package2,
  Handbag,
  Clock,
  User,
  UserCircle,
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
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
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
                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <StatusUpdateDropdown
              currentStatus={order.status}
              onStatusUpdate={handleStatusUpdate}
              isUpdatingStatus={isUpdatingStatus}
              size="sm"
            />
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
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-5">
          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {isMemberOrder ? (
                <User className="h-4 w-4 text-blue-500" />
              ) : (
                <UserCircle className="h-4 w-4 text-orange-500" />
              )}
              Customer Information
            </h3>

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
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    {isLoadingUser ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : userError ? (
                      <p className="text-sm text-destructive">Failed to load user details</p>
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
              /* Guest Order - Show info directly */
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {order.guestName || order.guestEmail || 'Guest'}
                  </p>
                </div>
                {order.guestEmail && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{order.guestEmail}</p>
                  </div>
                )}
                {order.guestPhone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{order.guestPhone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Order Type
            </h3>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TypeIcon
                  className={cn(
                    'h-5 w-5',
                    typeConfig?.color || 'text-gray-600',
                  )}
                />
                <span className="text-sm font-medium text-foreground">
                  {typeConfig?.label || order.orderType}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {order.orderType === 'DELIVERY'
                  ? 'Order will be delivered to the address'
                  : order.orderType === 'TAKEAWAY'
                    ? 'Customer will pick up the order'
                    : 'Pre-ordered for scheduled time'}
              </p>
            </div>
          </div>

          {order.estimatedPickupTime && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Estimated Pickup Time
              </h3>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm text-foreground">
                  {formatDate(order.estimatedPickupTime)}
                </p>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Delivery Address
              </h3>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm text-foreground">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
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
                <span className="text-foreground">
                  ${deliveryFee.toFixed(2)}
                </span>
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
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Information
            </h3>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="text-sm font-medium text-foreground">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <p
                  className={cn(
                    'text-sm font-medium',
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
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Special Instructions
              </h3>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              {order.estimatedReadyTime && (
                <div>
                  <span className="font-medium">Estimated Ready:</span>{' '}
                  {formatDate(order.estimatedReadyTime)}
                </div>
              )}
              {order.actualDeliveryTime && (
                <div>
                  <span className="font-medium">Delivered:</span>{' '}
                  {formatDate(order.actualDeliveryTime)}
                </div>
              )}
              {order.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {formatDate(order.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
