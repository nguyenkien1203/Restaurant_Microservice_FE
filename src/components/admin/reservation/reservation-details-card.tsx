import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  X,
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
} from 'lucide-react'
import type { ReservationResponse } from '@/lib/types/reservation'
import { formatTime24to12 } from '@/lib/api/reservation'
import { ReservationStatusDropdown } from './reservation-status-dropdown'
import type { ReservationStatus } from './reservation-row'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/lib/api/order'
import { getProfileById } from '@/lib/api/profile'

interface ReservationDetailsCardProps {
  reservation: ReservationResponse
  onClose: () => void
  onStatusUpdate?: (
    reservationId: number,
    newStatus: ReservationStatus,
  ) => Promise<void>
  isUpdatingStatus?: boolean
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReservationDetailsCard({
  reservation,
  onClose,
  onStatusUpdate,
  isUpdatingStatus = false,
}: ReservationDetailsCardProps) {
  const status = reservation.status as ReservationStatus
  const [isPreOrderExpanded, setIsPreOrderExpanded] = useState(false)
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const [isGuestExpanded, setIsGuestExpanded] = useState(false)

  const handleStatusUpdate = async (newStatus: ReservationStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(reservation.id, newStatus)
    }
  }

  // Fetch order details when expanded
  const {
    data: preOrder,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ['order', reservation.preOrderId],
    queryFn: () => getOrderById(String(reservation.preOrderId)),
    enabled: !!reservation.preOrderId && isPreOrderExpanded,
  })

  // Fetch user profile when expanded
  const {
    data: userProfile,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['profile', reservation.userId],
    queryFn: () => getProfileById(reservation.userId!),
    enabled: !!reservation.userId && isUserExpanded,
  })

  return (
    <Card className="sticky top-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-4 text-lg">
          Reservation #{reservation.id}
          <div className="font-normal">
          <ReservationStatusDropdown
            currentStatus={status}
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
        {/* Confirmation Code & Status */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">
            Confirmation Code
          </h4>
          <p className="font-mono text-lg font-bold text-primary">
            {reservation.confirmationCode}
          </p>
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Date & Time</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(reservation.reservationDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime24to12(reservation.startTime)} -{' '}
                {formatTime24to12(reservation.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Party & Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Party & Table</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.partySize} guests</span>
            </div>
            {reservation.table && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  Table {reservation.table.tableNumber}
                  {reservation.table.description && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({reservation.table.description})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Member User - Expandable */}
        {reservation.userId && (
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
                        User ID: {reservation.userId}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Guest Info (non-member) - Expandable */}
        {!reservation.userId &&
          (reservation.guestName ||
            reservation.guestEmail ||
            reservation.guestPhone) && (
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
                  {reservation.guestName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {reservation.guestName}
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  {reservation.guestEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reservation.guestEmail}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {reservation.guestPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reservation.guestPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Special Requests
            </h4>
            <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
              "{reservation.specialRequests}"
            </p>
          </div>
        )}

        {/* Pre-order - Expandable */}
        {reservation.preOrderId && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => setIsPreOrderExpanded(!isPreOrderExpanded)}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Pre-order #{reservation.preOrderId}
              </span>
              {isPreOrderExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isPreOrderExpanded && (
              <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                {isLoadingOrder ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : orderError ? (
                  <p className="text-sm text-destructive">
                    Failed to load order details
                  </p>
                ) : preOrder ? (
                  <>
                    {/* Order Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          preOrder.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : preOrder.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : preOrder.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {preOrder.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">
                        Items
                      </span>
                      <div className="space-y-1">
                        {preOrder.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.menuItemName}
                            </span>
                            <span className="text-muted-foreground">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm font-bold text-primary">
                        ${preOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Order Notes */}
                    {preOrder.notes && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Notes
                        </span>
                        <p className="text-sm italic">{preOrder.notes}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <p>Created: {formatDateTime(reservation.createdAt)}</p>
          <p>Updated: {formatDateTime(reservation.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
