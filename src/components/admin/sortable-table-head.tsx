import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'

export type SortDirection = 'asc' | 'desc'

interface SortableTableHeadProps<T extends string> {
  label: string
  field: T
  currentSortField: T | null
  currentSortDirection: SortDirection
  onSort: (field: T) => void
  className?: string
}

export function SortableTableHead<T extends string>({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  className,
}: SortableTableHeadProps<T>) {
  const isActive = currentSortField === field

  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
      >
        {label}
        {isActive ? (
          currentSortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}
