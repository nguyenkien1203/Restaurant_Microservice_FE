import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types/order'

interface StatusUpdateDropdownProps {
  currentStatus: OrderStatus
  onStatusUpdate?: (
    newStatus: OrderStatus,
    reason?: string,
  ) => Promise<void>
  isUpdatingStatus?: boolean
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
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
    color: 'text-teal-700',
    bgColor: 'bg-teal-100 hover:bg-teal-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
  },
}

const allStatuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
]

/**
 * Get valid next statuses based on current status
 * Based on backend validation logic:
 * - PENDING -> CONFIRMED, CANCELLED
 * - CONFIRMED -> PREPARING, CANCELLED
 * - PREPARING -> READY, CANCELLED
 * - READY -> OUT_FOR_DELIVERY, COMPLETED
 * - OUT_FOR_DELIVERY -> DELIVERED
 * - DELIVERED, COMPLETED, CANCELLED -> no transitions (terminal states)
 */
function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
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

export function StatusUpdateDropdown({
  currentStatus,
  onStatusUpdate,
  isUpdatingStatus = false,
  size = 'sm',
}: StatusUpdateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const config = statusConfig[currentStatus]
  const validNextStatuses = getValidNextStatuses(currentStatus)

  // Calculate dropdown position relative to viewport so it can render outside the table
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 260 // Approximate dropdown height

    const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
    setOpenUpward(shouldOpenUpward)

    const top = shouldOpenUpward
      ? Math.max(8, buttonRect.top - dropdownHeight)
      : Math.min(viewportHeight - 8, buttonRect.bottom)

    setDropdownPosition({
      top,
      left: buttonRect.left,
      width: buttonRect.width,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    updateDropdownPosition()

    const handleResizeOrScroll = () => {
      updateDropdownPosition()
    }

    window.addEventListener('resize', handleResizeOrScroll)
    window.addEventListener('scroll', handleResizeOrScroll, true)

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      window.removeEventListener('scroll', handleResizeOrScroll, true)
    }
  }, [isOpen])

  const handleStatusClick = async (newStatus: OrderStatus) => {
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
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isUpdatingStatus}
        className={cn(
          'text-xs px-2 py-1 h-auto',
          config.bgColor,
          config.color,
        )}
      >
        {isUpdatingStatus ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : null}
        {config.label}
      </Button>

      {isOpen &&
        dropdownPosition &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={cn(
                'fixed z-50 bg-popover border border-border rounded-md shadow-lg min-w-[160px]',
              )}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
              }}
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
          </>,
          document.body,
        )}
    </div>
  )
}
