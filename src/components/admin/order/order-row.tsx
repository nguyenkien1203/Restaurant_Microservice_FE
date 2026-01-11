import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package2, Handbag, Clock, User, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, OrderType } from '@/lib/types/order'
import { OrderStatusBadge } from '@/components/order/order-status-badge'

interface OrderRowProps {
  order: Order
  isSelected: boolean
  onSelect: () => void
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

export function OrderRow({ order, isSelected, onSelect }: OrderRowProps) {
  const typeConfig = orderTypeConfig[order.orderType]
  const isMemberOrder = !!order.userId

  const customerName = isMemberOrder
    ? 'Member'
    : order.guestName || order.guestEmail || 'Guest'

  const customerInfo = isMemberOrder
    ? order.userId
    : order.guestEmail || order.guestPhone || 'No contact info'

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
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">Order #{order.id}</p>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  typeConfig?.color || 'text-gray-600 bg-gray-100',
                )}
              >
                {typeConfig?.label || order.orderType}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isMemberOrder ? (
            <User className="h-4 w-4 text-blue-500" />
          ) : (
            <UserCircle className="h-4 w-4 text-orange-500" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {customerName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {customerInfo}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground">
          {order.orderItems.length} item
          {order.orderItems.length !== 1 ? 's' : ''}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-primary">
          ${order.totalAmount.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} size="sm" />
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
