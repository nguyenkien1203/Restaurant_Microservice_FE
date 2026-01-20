import { TableCell, TableRow } from '@/components/ui/table'
import { CalendarDays, Clock, Users, MapPin } from 'lucide-react'
import { cn, APP_TIMEZONE } from '@/lib/utils'
import type { ReservationResponse } from '@/lib/types/reservation'
import { formatTime24to12 } from '@/lib/api/reservation'
import { ReservationStatusDropdown } from './reservation-status-dropdown'
import { useQuery } from '@tanstack/react-query'
import { getProfileById } from '@/lib/api/profile'
import { Badge } from '@/components/ui/badge'

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

interface ReservationRowProps {
  reservation: ReservationResponse
  isSelected: boolean
  onSelect: () => void
  onStatusUpdate?: (
    reservationId: number,
    newStatus: ReservationStatus,
  ) => Promise<void>
  isUpdatingStatus?: boolean
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  })
}

export function ReservationRow({
  reservation,
  isSelected,
  onSelect,
  onStatusUpdate,
  isUpdatingStatus = false,
}: ReservationRowProps) {
  const status = reservation.status as ReservationStatus

  // Fetch user profile for member reservations
  const { data: userProfile } = useQuery({
    queryKey: ['profile', reservation.userId],
    queryFn: () => getProfileById(reservation.userId!),
    enabled: !!reservation.userId,
  })

  const handleStatusUpdate = async (newStatus: ReservationStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(reservation.id, newStatus)
    }
  }

  return (
    <TableRow
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all',
        isSelected && 'bg-muted/30',
      )}
    >
      <TableCell className="py-3">
        <span className="text-sm font-medium text-foreground">
          #{reservation.id}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <span className="font-mono text-sm font-medium text-primary">
          {reservation.confirmationCode}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4" />
          {formatDate(reservation.reservationDate)}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          {formatTime24to12(reservation.startTime)}
        </div>
      </TableCell>
      <TableCell className="py-3">
        {reservation.table?.tableNumber ? (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {reservation.table.tableNumber}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-col">
          {reservation.userId && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm truncate max-w-[100px]">
                {userProfile?.fullName || 'Member'}
              </span>
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] font-semibold shrink-0"
              >
                Member
              </Badge>
            </div>
          )}
          {reservation.guestName && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm truncate max-w-[100px]">
                {reservation.guestName}
              </span>
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-semibold shrink-0"
              >
                Guest
              </Badge>
            </div>
          )}
          {!reservation.userId && !reservation.guestName && (
            <span className="text-sm">-</span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          {reservation.partySize}
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <ReservationStatusDropdown
          currentStatus={status}
          onStatusUpdate={handleStatusUpdate}
          isUpdatingStatus={isUpdatingStatus}
        />
      </TableCell>
      <TableCell className="py-3">
        {reservation.preOrderId ? (
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
            Order #{reservation.preOrderId}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}
