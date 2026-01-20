import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, AlertCircle, Wrench } from 'lucide-react'
import type { Table } from '@/lib/types/table'
import { cn } from '@/lib/utils'

interface TableCardProps {
  table: Table
}

const statusConfig: Record<
  Table['status'],
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  AVAILABLE: {
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-100 dark:bg-green-950',
    icon: CheckCircle,
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    icon: Users,
  },
  RESERVED: {
    label: 'Reserved',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    icon: AlertCircle,
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    icon: Wrench,
  },
}

export function TableCard({ table }: TableCardProps) {
  const statusInfo = statusConfig[table.status]
  const StatusIcon = statusInfo.icon

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg py-2',
        !table.isActive && 'opacity-60',
        table.status === 'AVAILABLE' && 'border-green-200 dark:border-green-900',
        table.status === 'OCCUPIED' && 'border-blue-200 dark:border-blue-900',
        table.status === 'RESERVED' && 'border-purple-200 dark:border-purple-900',
        table.status === 'MAINTENANCE' && 'border-orange-200 dark:border-orange-900'
      )}
    >
      {/* Status accent bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          table.status === 'AVAILABLE' && 'bg-green-500',
          table.status === 'OCCUPIED' && 'bg-blue-500',
          table.status === 'RESERVED' && 'bg-purple-500',
          table.status === 'MAINTENANCE' && 'bg-orange-500'
        )}
      />

      <CardContent className="p-6">
        <div className="flex flex-col mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground mb-1">
              {table.tableNumber}
            </h3>
            <Badge
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 hover:none pointer-events-none',
              statusInfo.color,
              statusInfo.bgColor,
              'border-0'
            )}
            >
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
            </Badge>
          </div>
          {table.description && (
              <p className="text-sm text-muted-foreground">
                {table.description}
              </p>
            )}
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacity
            </span>
            <span className="font-semibold text-foreground">
              {table.minCapacity} - {table.capacity} guests
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span
              className={cn(
                'font-medium',
                table.isActive ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {table.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
