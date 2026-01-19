import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import type { ReservationStatus } from './reservation-row'

interface ReservationStatusDropdownProps {
    currentStatus: ReservationStatus
    onStatusUpdate: (newStatus: ReservationStatus) => Promise<void>
    isUpdatingStatus?: boolean
}

const statusConfig: Record<ReservationStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100 hover:bg-yellow-200' },
    CONFIRMED: { label: 'Confirmed', color: 'text-green-700', bgColor: 'bg-green-100 hover:bg-green-200' },
    SEATED: { label: 'Seated', color: 'text-orange-700', bgColor: 'bg-orange-100 hover:bg-orange-200' },
    COMPLETED: { label: 'Completed', color: 'text-blue-700', bgColor: 'bg-blue-100 hover:bg-blue-200' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200' },
    NO_SHOW: { label: 'No Show', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200' },
}

const allStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

/**
 * Get valid next statuses based on current status
 * Based on backend validation logic:
 * - PENDING -> CONFIRMED, CANCELLED
 * - CONFIRMED -> SEATED, CANCELLED, NO_SHOW
 * - SEATED -> COMPLETED
 * - COMPLETED, CANCELLED, NO_SHOW -> no transitions (terminal states)
 */
function getValidNextStatuses(currentStatus: ReservationStatus): ReservationStatus[] {
    switch (currentStatus) {
        case 'PENDING':
            return ['CONFIRMED', 'CANCELLED']
        case 'CONFIRMED':
            return ['SEATED', 'CANCELLED', 'NO_SHOW']
        case 'SEATED':
            return ['COMPLETED']
        case 'COMPLETED':
        case 'CANCELLED':
        case 'NO_SHOW':
            return [] // Terminal states - no transitions allowed
        default:
            return []
    }
}

export function ReservationStatusDropdown({
    currentStatus,
    onStatusUpdate,
    isUpdatingStatus = false,
}: ReservationStatusDropdownProps) {
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

    const updateDropdownPosition = () => {
        if (!buttonRef.current) return
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - buttonRect.bottom
        const spaceAbove = buttonRect.top
        const dropdownHeight = 220 // Approximate height of dropdown

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

    const handleStatusClick = async (newStatus: ReservationStatus) => {
        if (newStatus === currentStatus) {
            setIsOpen(false)
            return
        }
        // Don't allow invalid transitions
        if (!validNextStatuses.includes(newStatus)) {
            return
        }
        await onStatusUpdate(newStatus)
        setIsOpen(false)
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
                                'fixed z-50 bg-popover border border-border rounded-md shadow-lg min-w-[140px]',
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
                                    validNextStatuses.includes(status) ||
                                    status === currentStatus
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
