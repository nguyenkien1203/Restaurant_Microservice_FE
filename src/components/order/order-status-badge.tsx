import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CheckCircle2,
  XCircle,
  CircleDot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types/order'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  string,
  {
    label: string
    icon: React.ElementType
    className: string
  }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle2,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function OrderStatusBadge({
  status,
  showIcon = true,
  size = 'md',
}: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    icon: CircleDot,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const Icon = config.icon
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border inline-flex items-center gap-1.5',
        config.className,
        sizeClasses,
        // Remove hover effects - prevent background color change
        'hover:bg-inherit!',
      )}
    >
      {showIcon && (
        <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      )}
      {config.label}
    </Badge>
  )
}
