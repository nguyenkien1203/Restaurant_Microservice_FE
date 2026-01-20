import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCard } from '@/components/admin/table'
import { getAllTables } from '@/lib/api/table'
import type { Table, TableStatus } from '@/lib/types/table'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export const Route = createFileRoute('/admin/tables')({
  component: AdminTables,
})

function AdminTables() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all')

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
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim()
        const matchesSearch =
          table.tableNumber.toLowerCase().includes(query) ||
          (table.description?.toLowerCase().includes(query) ?? false)

        if (!matchesSearch) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== 'all' && table.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [tables, searchQuery, statusFilter])

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by table number or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TableStatus | 'all')}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'OCCUPIED', label: 'Occupied' },
                { value: 'RESERVED', label: 'Reserved' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
              ]}
              placeholder="Status"
              className="w-full sm:w-[180px]"
            />
          </div>

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
              {searchQuery || statusFilter !== 'all'
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
