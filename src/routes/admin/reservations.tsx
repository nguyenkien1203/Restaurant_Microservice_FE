import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useMemo, useCallback } from 'react'
import { getAllReservations, type ReservationResponse } from '@/lib/api/reservation'
import { cn } from '@/lib/utils'
import {
  AdminPageHeader,
  ActiveFilterTags,
  SortableTableHead,
  TableLoadingState,
  TableErrorState,
  TableEmptyState,
  type SortDirection,
} from '@/components/admin'
import {
  ReservationRow,
  ReservationFilters,
  ReservationDetailsCard,
  type ReservationStatus,
  type ReservationStatusFilter,
} from '@/components/admin/reservation'

export const Route = createFileRoute('/admin/reservations')({
  component: AdminReservations,
})

type SortField = 'code' | 'date' | 'time' | 'guests' | 'status' | null

function useReservationFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatusFilter>('all')
  const [dateFilter, setDateFilter] = useState('')

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFilter('')
  }, [])

  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== 'all' ||
    dateFilter !== ''

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    clearAllFilters,
    hasActiveFilters,
  }
}

function useReservationSorting() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((currentDir) => {
          if (currentDir === 'asc') return 'desc'
          setSortField(null)
          return 'asc'
        })
        return field
      }
      setSortDirection('asc')
      return field
    })
  }, [])

  return { sortField, sortDirection, handleSort }
}

function AdminReservations() {
  const queryClient = useQueryClient()
  const filters = useReservationFilters()
  const sorting = useReservationSorting()
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)

  const {
    data: reservations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminReservations'],
    queryFn: getAllReservations,
  })

  // TODO: Implement status update mutation when API is available
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      reservationId,
      newStatus,
    }: {
      reservationId: number
      newStatus: ReservationStatus
    }) => {
      // TODO: Call API to update status
      console.log('Update reservation', reservationId, 'to', newStatus)
      throw new Error('Status update API not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] })
    },
  })

  const handleStatusUpdate = async (
    reservationId: number,
    newStatus: ReservationStatus,
  ) => {
    await updateStatusMutation.mutateAsync({ reservationId, newStatus })
  }

  const filteredReservations = useMemo(() => {
    return reservations
      .filter((reservation) => {
        // Search filter
        const searchLower = filters.searchQuery.toLowerCase()
        const matchesSearch =
          reservation.confirmationCode.toLowerCase().includes(searchLower) ||
          reservation.guestName?.toLowerCase().includes(searchLower) ||
          reservation.guestEmail?.toLowerCase().includes(searchLower) ||
          reservation.guestPhone?.includes(filters.searchQuery) ||
          reservation.table?.tableNumber?.toLowerCase().includes(searchLower)

        // Status filter
        const matchesStatus =
          filters.statusFilter === 'all' ||
          reservation.status === filters.statusFilter

        // Date filter
        const matchesDate =
          !filters.dateFilter ||
          reservation.reservationDate === filters.dateFilter

        return matchesSearch && matchesStatus && matchesDate
      })
      .sort((a, b) => {
        if (!sorting.sortField) {
          // Default: sort by date descending (most recent first)
          return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
        }
        const modifier = sorting.sortDirection === 'asc' ? 1 : -1
        if (sorting.sortField === 'code')
          return a.confirmationCode.localeCompare(b.confirmationCode) * modifier
        if (sorting.sortField === 'date')
          return (new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime()) * modifier
        if (sorting.sortField === 'time')
          return a.startTime.localeCompare(b.startTime) * modifier
        if (sorting.sortField === 'guests')
          return (a.partySize - b.partySize) * modifier
        if (sorting.sortField === 'status')
          return a.status.localeCompare(b.status) * modifier
        return 0
      })
  }, [
    reservations,
    filters.searchQuery,
    filters.statusFilter,
    filters.dateFilter,
    sorting.sortField,
    sorting.sortDirection,
  ])

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
      tags.push({
        id: 'status',
        label: filters.statusFilter,
        onRemove: () => filters.setStatusFilter('all'),
      })
    }
    if (filters.dateFilter) {
      tags.push({
        id: 'date',
        label: filters.dateFilter,
        onRemove: () => filters.setDateFilter(''),
      })
    }
    return tags
  }, [filters])

  const totalReservations = reservations.length

  const reservationStatuses: ReservationStatus[] = [
    'PENDING',
    'CONFIRMED',
    'SEATED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]
  const statusCounts = reservationStatuses.reduce<Record<string, number>>(
    (acc, status) => {
      acc[status] = reservations.filter((r) => r.status === status).length
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reservations"
        description="Manage and track all table reservations"
      />

      <div className="flex flex-col lg:flex-row gap-6 transition-all duration-300">
        {/* Table Section */}
        <div
          className={cn(
            'transition-all duration-300',
            selectedReservation ? 'lg:w-1/2 w-full' : 'w-full',
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    All Reservations ({totalReservations})
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      {statusCounts['PENDING']} Pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {statusCounts['CONFIRMED']} Confirmed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {statusCounts['SEATED']} Seated
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-500" />
                      {statusCounts['COMPLETED']} Completed
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ReservationFilters
                searchQuery={filters.searchQuery}
                onSearchChange={filters.setSearchQuery}
                statusFilter={filters.statusFilter}
                onStatusChange={filters.setStatusFilter}
                dateFilter={filters.dateFilter}
                onDateChange={filters.setDateFilter}
              />

              <ActiveFilterTags
                tags={filterTags}
                onClearAll={filters.clearAllFilters}
                resultCount={
                  filters.hasActiveFilters ? filteredReservations.length : undefined
                }
                totalCount={filters.hasActiveFilters ? totalReservations : undefined}
              />

              {isLoading ? (
                <TableLoadingState message="Loading reservations..." />
              ) : error ? (
                <TableErrorState
                  error={error}
                  fallbackMessage="Failed to load reservations"
                />
              ) : filteredReservations.length === 0 ? (
                <TableEmptyState message="No reservations found." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Confirmation"
                        field="code"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <SortableTableHead
                        label="Date"
                        field="date"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <SortableTableHead
                        label="Time"
                        field="time"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <TableHead>Table</TableHead>
                      <SortableTableHead
                        label="Guests"
                        field="guests"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <SortableTableHead
                        label="Status"
                        field="status"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <TableHead>Pre-order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <ReservationRow
                        key={reservation.id}
                        reservation={reservation}
                        isSelected={selectedReservation?.id === reservation.id}
                        onSelect={() => setSelectedReservation(reservation)}
                        onStatusUpdate={handleStatusUpdate}
                        isUpdatingStatus={updateStatusMutation.isPending}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Card Section */}
        {selectedReservation && (
          <div className="lg:w-1/2 w-full animate-in slide-in-from-right duration-300 max-h-[calc(100vh-12rem)]">
            <ReservationDetailsCard
              reservation={selectedReservation}
              onClose={() => setSelectedReservation(null)}
              onStatusUpdate={handleStatusUpdate}
              isUpdatingStatus={updateStatusMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  )
}
