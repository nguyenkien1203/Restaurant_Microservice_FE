import { TableCell, TableRow } from '@/components/ui/table'
import { CalendarDays, Clock, Users, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReservationResponse } from '@/lib/types/reservation'
import { formatTime24to12 } from '@/lib/api/reservation'
import { ReservationStatusDropdown } from './reservation-status-dropdown'

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
  })
}

const statusConfig: Record<
  ReservationStatus,
  { color: string; bgColor: string }
> = {
  PENDING: { color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  CONFIRMED: { color: 'text-green-700', bgColor: 'bg-green-100' },
  SEATED: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  COMPLETED: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CANCELLED: { color: 'text-red-700', bgColor: 'bg-red-100' },
  NO_SHOW: { color: 'text-red-700', bgColor: 'bg-red-100' },
}

export function ReservationRow({
  reservation,
  isSelected,
  onSelect,
  onStatusUpdate,
  isUpdatingStatus = false,
}: ReservationRowProps) {
  const status = reservation.status as ReservationStatus
  const config = statusConfig[status] || statusConfig.PENDING

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {formatDate(reservation.reservationDate)}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime24to12(reservation.startTime)}
        </div>
      </TableCell>
      <TableCell className="py-3">
        {reservation.table?.tableNumber ? (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {reservation.table.tableNumber}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-col">
          {reservation.userId && (
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              Member
            </span>
          )}
          {reservation.guestName && (
            <span className="text-xs text-muted-foreground">
              {reservation.guestName}
            </span>
          )}
          {!reservation.userId && !reservation.guestName && (
            <span className="text-xs text-muted-foreground">-</span>
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
            #{reservation.preOrderId}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}
