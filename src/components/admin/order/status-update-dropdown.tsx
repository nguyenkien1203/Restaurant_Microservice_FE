import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
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

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const getDefaultReason = (status: OrderStatus): string => {
  const reasons: Record<OrderStatus, string> = {
    PENDING: 'Order set to pending',
    CONFIRMED: 'Order confirmed by admin',
    PREPARING: 'Order is being prepared',
    READY: 'Order is ready for pickup/delivery',
    OUT_FOR_DELIVERY: 'Order is out for delivery',
    DELIVERED: 'Order has been delivered',
    COMPLETED: 'Order completed',
    CANCELLED: 'Order cancelled by admin',
  }
  return reasons[status] || 'Status updated by admin'
}

export function StatusUpdateDropdown({
  currentStatus,
  onStatusUpdate,
  isUpdatingStatus = false,
  size = 'sm',
}: StatusUpdateDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [reason, setReason] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleStatusSelect = (status: OrderStatus) => {
    if (status === currentStatus) {
      setIsDropdownOpen(false)
      return
    }
    setSelectedStatus(status)
    setReason(getDefaultReason(status))
    setIsDropdownOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmStatusUpdate = async () => {
    if (selectedStatus && onStatusUpdate) {
      await onStatusUpdate(selectedStatus, reason || undefined)
      setIsConfirmModalOpen(false)
      setSelectedStatus(null)
      setReason('')
    }
  }

  const handleCancelStatusUpdate = () => {
    setIsConfirmModalOpen(false)
    setSelectedStatus(null)
    setReason('')
  }

  if (!onStatusUpdate) {
    return <OrderStatusBadge status={currentStatus} size={size} />
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsDropdownOpen(!isDropdownOpen)
          }}
          disabled={isUpdatingStatus}
          className="flex items-center gap-1.5"
        >
          <OrderStatusBadge status={currentStatus} size={size} />
          <ChevronDown
            className={cn(
              'h-3 w-3 text-muted-foreground transition-transform',
              isDropdownOpen && 'rotate-180',
              isUpdatingStatus && 'opacity-50',
            )}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-card border border-border rounded-lg shadow-lg z-50 py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusSelect(option.value)
                }}
                disabled={option.value === currentStatus}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left transition-colors',
                  option.value === currentStatus && 'opacity-50 cursor-not-allowed',
                )}
              >
                {option.value === currentStatus && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                <span
                  className={cn(
                    option.value === currentStatus && 'font-medium',
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      <Dialog
        open={isConfirmModalOpen}
        onClose={handleCancelStatusUpdate}
        className="max-w-md"
      >
        <DialogHeader onClose={handleCancelStatusUpdate}>
          <DialogTitle>Confirm Status Update</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Update order status from{' '}
                <span className="font-medium text-foreground">
                  {currentStatus}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                  {selectedStatus}
                </span>
                ?
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-reason">Reason</Label>
              <Textarea
                id="confirm-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isUpdatingStatus}
                rows={3}
                placeholder="Enter reason for status change..."
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancelStatusUpdate}
            disabled={isUpdatingStatus}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            disabled={isUpdatingStatus || !selectedStatus}
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm Update'
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
