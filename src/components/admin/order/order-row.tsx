import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package2, Handbag, Clock, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, OrderType, OrderStatus } from '@/lib/types/order'
import { StatusUpdateDropdown } from './status-update-dropdown'

interface OrderRowProps {
  order: Order
  isSelected: boolean
  onSelect: () => void
  onStatusUpdate?: (
    orderId: number,
    newStatus: OrderStatus,
    reason?: string,
  ) => Promise<void>
  isUpdatingStatus?: boolean
}

const orderTypeConfig: Record<
  OrderType,
  { icon: React.ElementType; label: string; color: string }
> = {
  DELIVERY: {
    icon: Package2,
    label: 'Delivery',
    color: 'text-green-600 bg-green-100',
  },
  TAKEAWAY: {
    icon: Handbag,
    label: 'Takeaway',
    color: 'text-orange-600 bg-orange-100',
  },
  PRE_ORDER: {
    icon: Clock,
    label: 'Pre-Order',
    color: 'text-purple-600 bg-purple-100',
  },
  DINE_IN: {
    icon: UtensilsCrossed,
    label: 'Dine In',
    color: 'text-blue-600 bg-blue-100',
  },
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderRow({
  order,
  isSelected,
  onSelect,
  onStatusUpdate,
  isUpdatingStatus = false,
}: OrderRowProps) {
  const typeConfig = orderTypeConfig[order.orderType]
  const isMemberOrder = !!order.userId

  const customerName = isMemberOrder
    ? 'Member'
    : order.guestName || order.guestEmail || 'Guest'

  const customerInfo = isMemberOrder
    ? order.userId
    : order.guestEmail || order.guestPhone || 'No contact info'

  const totalItems = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  )

  const handleStatusUpdate = async (
    newStatus: OrderStatus,
    reason?: string,
  ) => {
    if (onStatusUpdate) {
      await onStatusUpdate(order.id, newStatus, reason)
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
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Order #{order.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <span className="text-sm text-foreground">
          {formatDate(order.createdAt)}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              typeConfig?.color || 'text-gray-600 bg-gray-100',
            )}
          >
            {typeConfig?.label || order.orderType}
          </span>
        </div>
      </TableCell>
      {/* <TableCell>
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {customerName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {customerInfo}
            </p>
          </div>
        </div>
      </TableCell> */}
      <TableCell>
        <span className="text-sm text-foreground">
          {totalItems} item
          {totalItems !== 1 ? 's' : ''}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-foreground">${order.totalAmount.toFixed(2)}</span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <StatusUpdateDropdown
          currentStatus={order.status}
          onStatusUpdate={handleStatusUpdate}
          isUpdatingStatus={isUpdatingStatus}
          size="sm"
        />
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  )
}
