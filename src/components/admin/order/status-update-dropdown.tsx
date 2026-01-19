import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/lib/types/order'

type StatusUnion = OrderStatus | PaymentStatus

interface StatusConfig {
  label: string
  color: string
  bgColor: string
}

interface BaseStatusDropdownProps<T extends StatusUnion> {
  currentStatus: T
  allStatuses: readonly T[]
  config: Record<T, StatusConfig>
  getValidNextStatuses?: (currentStatus: T) => readonly T[]
  onStatusUpdate?: (newStatus: T, reason?: string) => Promise<void>
  isUpdatingStatus?: boolean
  size?: 'sm' | 'md'
}

function StatusDropdownBase<T extends StatusUnion>({
  currentStatus,
  allStatuses,
  config: statusConfig,
  getValidNextStatuses,
  onStatusUpdate,
  isUpdatingStatus = false,
  size = 'sm',
}: BaseStatusDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const config = statusConfig[currentStatus]
  const validNextStatuses = getValidNextStatuses?.(currentStatus) ?? allStatuses

  const handleStatusClick = async (newStatus: T) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }
    // Don't allow invalid transitions
    if (!validNextStatuses.includes(newStatus)) {
      return
    }
    if (onStatusUpdate) {
      await onStatusUpdate(newStatus)
    }
    setIsOpen(false)
  }

  if (!onStatusUpdate) {
    // Read-only badge
    return (
      <span
        className={cn(
          'text-xs font-medium px-2 py-0.5 rounded',
          config.bgColor,
          config.color,
        )}
      >
        {config.label}
      </span>
    )
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        // Map custom size to button size props (we only use 'sm' vs default)
        size={size === 'sm' ? 'sm' : 'default'}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isUpdatingStatus}
        className={cn('text-xs px-2 py-1 h-auto', config.bgColor, config.color)}
      >
        {isUpdatingStatus ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : null}
        {config.label}
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-2 z-50 bg-popover border border-border rounded-md shadow-lg min-w-[160px]',
          )}
          style={{ minWidth: buttonRef.current?.offsetWidth }}
        >
          {allStatuses.map((status) => {
            const statusConf = statusConfig[status]
            const isValid =
              validNextStatuses.includes(status) || status === currentStatus
            const isDisabled = !isValid

            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                  status === currentStatus && 'bg-accent',
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-accent cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    status === currentStatus
                      ? statusConf.bgColor.split(' ')[0]
                      : isDisabled
                        ? 'bg-transparent border border-muted-foreground/30'
                        : 'bg-transparent border border-border',
                  )}
                />
                {statusConf.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===== Order Status Dropdown (uses base component) =====

const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
  },
  PREPARING: {
    label: 'Preparing',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
  },
  READY: {
    label: 'Ready',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
  },
}

const orderStatuses: readonly OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
] as const

/**
 * Valid next statuses for order status
 */
function getOrderValidNextStatuses(
  currentStatus: OrderStatus,
): readonly OrderStatus[] {
  switch (currentStatus) {
    case 'PENDING':
      return ['CONFIRMED', 'CANCELLED']
    case 'CONFIRMED':
      return ['PREPARING', 'CANCELLED']
    case 'PREPARING':
      return ['READY', 'CANCELLED']
    case 'READY':
      return ['OUT_FOR_DELIVERY', 'COMPLETED']
    case 'OUT_FOR_DELIVERY':
      return ['DELIVERED']
    case 'DELIVERED':
    case 'COMPLETED':
    case 'CANCELLED':
      return [] // Terminal states - no transitions allowed
    default:
      return []
  }
}

export interface OrderStatusDropdownProps {
  currentStatus: OrderStatus
  onStatusUpdate?: (newStatus: OrderStatus, reason?: string) => Promise<void>
  isUpdatingStatus?: boolean
  size?: 'sm' | 'md'
}

export function OrderStatusDropdown(props: OrderStatusDropdownProps) {
  const { currentStatus, onStatusUpdate, isUpdatingStatus, size } = props

  return (
    <StatusDropdownBase<OrderStatus>
      currentStatus={currentStatus}
      allStatuses={orderStatuses}
      config={orderStatusConfig}
      getValidNextStatuses={getOrderValidNextStatuses}
      onStatusUpdate={onStatusUpdate}
      isUpdatingStatus={isUpdatingStatus}
      size={size}
    />
  )
}

// ===== Payment Status Dropdown (uses base component) =====

const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
  },
  PAID: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
  },
  FAILED: {
    label: 'Failed',
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
  },
}

const paymentStatuses: readonly PaymentStatus[] = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
] as const

function getPaymentValidNextStatuses(
  currentStatus: PaymentStatus,
): readonly PaymentStatus[] {
  switch (currentStatus) {
    case 'PENDING':
      return ['PAID', 'FAILED']
    case 'PAID':
      return ['REFUNDED']
    case 'FAILED':
    case 'REFUNDED':
    default:
      return []
  }
}

export interface PaymentStatusDropdownProps {
  currentStatus: PaymentStatus
  onStatusUpdate?: (newStatus: PaymentStatus) => Promise<void>
  isUpdatingStatus?: boolean
  size?: 'sm' | 'md'
}

export function PaymentStatusDropdown(props: PaymentStatusDropdownProps) {
  const { currentStatus, onStatusUpdate, isUpdatingStatus, size } = props

  const handleUpdate = async (newStatus: PaymentStatus, _reason?: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(newStatus)
    }
  }

  return (
    <StatusDropdownBase<PaymentStatus>
      currentStatus={currentStatus}
      allStatuses={paymentStatuses}
      config={paymentStatusConfig}
      getValidNextStatuses={getPaymentValidNextStatuses}
      onStatusUpdate={handleUpdate}
      isUpdatingStatus={isUpdatingStatus}
      size={size}
    />
  )
}
