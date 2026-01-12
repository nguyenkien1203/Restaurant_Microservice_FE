import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
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
    SEATED: { label: 'Seated', color: 'text-blue-700', bgColor: 'bg-blue-100 hover:bg-blue-200' },
    COMPLETED: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100 hover:bg-gray-200' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200' },
    NO_SHOW: { label: 'No Show', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200' },
}

const allStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export function ReservationStatusDropdown({
    currentStatus,
    onStatusUpdate,
    isUpdatingStatus = false,
}: ReservationStatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const config = statusConfig[currentStatus]

    const handleStatusClick = async (newStatus: ReservationStatus) => {
        if (newStatus === currentStatus) {
            setIsOpen(false)
            return
        }
        await onStatusUpdate(newStatus)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
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

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-md shadow-lg min-w-[140px]">
                        {allStatuses.map((status) => {
                            const statusConf = statusConfig[status]
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusClick(status)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                                        status === currentStatus && 'bg-accent',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            status === currentStatus
                                                ? statusConf.bgColor.split(' ')[0]
                                                : 'bg-transparent border border-border',
                                        )}
                                    />
                                    {statusConf.label}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
