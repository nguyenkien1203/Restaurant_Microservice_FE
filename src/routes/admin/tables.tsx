import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCard } from '@/components/admin/table'
import { getAllTables } from '@/lib/api/table'
import type { Table, TableStatus } from '@/lib/types/table'
import { Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminPageHeader, ActiveFilterTags } from '@/components/admin'
import {
  FilterDropdown,
  FilterDropdownHeader,
} from '@/components/admin/filter-dropdown'
import { SearchInput } from '@/components/admin/search-input'

export const Route = createFileRoute('/admin/tables')({
  component: AdminTables,
})

type TableStatusFilter = TableStatus | 'all'

const tableStatusConfig: Record<TableStatus, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available', color: 'bg-green-500' },
  OCCUPIED: { label: 'Occupied', color: 'bg-blue-500' },
  RESERVED: { label: 'Reserved', color: 'bg-purple-500' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-orange-500' },
}

function useTableFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TableStatusFilter>('all')

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
  }, [])

  const hasActiveFilters = searchQuery.length > 0 || statusFilter !== 'all'

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    hasActiveFilters,
  }
}

function AdminTables() {
  const filters = useTableFilters()

  const {
    data: tables = [],
    isLoading,
    error,
  } = useQuery<Table[]>({
    queryKey: ['admin', 'tables'],
    queryFn: getAllTables,
  })

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchesSearch =
          table.tableNumber.toLowerCase().includes(query) ||
          (table.description?.toLowerCase().includes(query) ?? false)

        if (!matchesSearch) {
          return false
        }
      }

      // Status filter
      if (filters.statusFilter !== 'all' && table.status !== filters.statusFilter) {
        return false
      }

      return true
    })
  }, [tables, filters.searchQuery, filters.statusFilter])

  const filterTags = useMemo(() => {
    const tags = []
    if (filters.searchQuery) {
      tags.push({
        id: 'search',
        label: `"${filters.searchQuery}"`,
        onRemove: () => filters.setSearchQuery(''),
      })
    }
    if (filters.statusFilter !== 'all') {
      const config = tableStatusConfig[filters.statusFilter]
      tags.push({
        id: 'status',
        label: config.label,
        onRemove: () => filters.setStatusFilter('all'),
      })
    }
    return tags
  }, [filters])

  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length
  const reservedCount = tables.filter((t) => t.status === 'RESERVED').length
  const maintenanceCount = tables.filter((t) => t.status === 'MAINTENANCE').length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Table Management"
        description="View and track all restaurant tables"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                All Tables ({tables.length})
              </CardTitle>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {availableCount} Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {occupiedCount} Occupied
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  {reservedCount} Reserved
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  {maintenanceCount} Maintenance
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={filters.searchQuery}
                onChange={filters.setSearchQuery}
                placeholder="Search by table number or description..."
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {/* Table Status Filter */}
              <FilterDropdown
                label="Status"
                icon={<CheckCircle className="h-4 w-4" />}
                hasActiveFilters={filters.statusFilter !== 'all'}
              >
                <FilterDropdownHeader>Table Status</FilterDropdownHeader>
                <div>
                  {[
                    { value: 'all', label: 'All Statuses', color: 'bg-primary' },
                    ...Object.entries(tableStatusConfig).map(([value, config]) => ({
                      value,
                      label: config.label,
                      color: config.color,
                    })),
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        filters.setStatusFilter(option.value as TableStatusFilter)
                      }
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                        filters.statusFilter === option.value && 'bg-accent',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          filters.statusFilter === option.value
                            ? option.color
                            : 'bg-transparent border border-border',
                        )}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </FilterDropdown>
            </div>
          </div>

          <ActiveFilterTags
            tags={filterTags}
            onClearAll={filters.clearAllFilters}
            resultCount={filters.hasActiveFilters ? filteredTables.length : undefined}
            totalCount={filters.hasActiveFilters ? tables.length : undefined}
          />

          {/* Tables Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Failed to load tables. Please try again.
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {filters.hasActiveFilters
                ? 'No tables match your filters'
                : 'No tables found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
