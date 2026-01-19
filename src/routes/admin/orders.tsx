import { createFileRoute, useSearch } from '@tanstack/react-router'
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
import {
  getAdminOrders,
  updateOrderStatus,
  createDineInOrder,
  updateOrderPaymentStatus,
} from '@/lib/api/order'
import type { OrderType, OrderStatus, PaymentStatus } from '@/lib/types/order'
import type { CreateDineInOrderRequest } from '@/lib/types/order'
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
  OrderRow,
  OrderFilters,
  OrderDetailsCard,
  DineInOrderDialog,
  type OrderStatusFilter,
  type CustomerTypeFilter,
} from '@/components/admin/order'
import { User, UserCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaymentStatusFilter } from '@/components/admin/order/order-filters'
import type { Order } from '@/lib/types/order'

interface OrdersSearchParams {
  orderId?: number
}

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrders,
  validateSearch: (search: Record<string, unknown>): OrdersSearchParams => {
    return {
      orderId: search.orderId ? Number(search.orderId) : undefined,
    }
  },
})

type SortField = 'id' | 'date' | 'total' | 'status' | 'payment' | null

function useOrderFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>('all')
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<OrderType[]>([])
  const [customerTypeFilter, setCustomerTypeFilter] =
    useState<CustomerTypeFilter>('all')

  const toggleOrderType = useCallback((type: OrderType) => {
    setSelectedOrderTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setPaymentStatusFilter('all')
    setSelectedOrderTypes([])
    setCustomerTypeFilter('all')
  }, [])

  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== 'all' ||
    paymentStatusFilter !== 'all' ||
    selectedOrderTypes.length > 0 ||
    customerTypeFilter !== 'all'

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    selectedOrderTypes,
    setSelectedOrderTypes,
    toggleOrderType,
    customerTypeFilter,
    setCustomerTypeFilter,
    clearAllFilters,
    hasActiveFilters,
  }
}

function useOrderSorting() {
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

function AdminOrders() {
  const queryClient = useQueryClient()
  const filters = useOrderFilters()
  const sorting = useOrderSorting()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDineInDialogOpen, setIsDineInDialogOpen] = useState(false)
  const { orderId: urlOrderId } = useSearch({ from: '/admin/orders' })

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      newStatus,
      reason,
    }: {
      orderId: number
      newStatus: OrderStatus
      reason?: string
    }) => updateOrderStatus(orderId, { newStatus, reason }),
    onSuccess: (updatedOrder) => {
      // Update the orders list
      queryClient.setQueryData<Order[]>(['adminOrders'], (oldOrders) => {
        if (!oldOrders) return [updatedOrder]
        return oldOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        )
      })
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder)
      }
    },
  })

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: OrderStatus,
    reason?: string,
  ) => {
    await updateStatusMutation.mutateAsync({ orderId, newStatus, reason })
  }

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      newPaymentStatus,
    }: {
      orderId: number
      newPaymentStatus: PaymentStatus
    }) => updateOrderPaymentStatus(orderId, { newPaymentStatus }),
    onSuccess: (updatedOrder) => {
      // Update the orders list
      queryClient.setQueryData<Order[]>(['adminOrders'], (oldOrders) => {
        if (!oldOrders) return [updatedOrder]
        return oldOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        )
      })
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder)
      }
    },
  })

  const handlePaymentStatusUpdate = async (
    orderId: number,
    newStatus: PaymentStatus,
  ) => {
    await updatePaymentStatusMutation.mutateAsync({
      orderId,
      newPaymentStatus: newStatus,
    })
  }

  const createDineInMutation = useMutation({
    mutationFn: (data: CreateDineInOrderRequest) => createDineInOrder(data),
    onSuccess: (newOrder) => {
      // Add the new order to the list
      queryClient.setQueryData<Order[]>(['adminOrders'], (oldOrders) => {
        if (!oldOrders) return [newOrder]
        return [newOrder, ...oldOrders]
      })
      // Select the newly created order
      setSelectedOrder(newOrder)
      setIsDineInDialogOpen(false)
    },
  })

  const handleCreateDineIn = async (data: CreateDineInOrderRequest) => {
    await createDineInMutation.mutateAsync(data)
  }

  const orderTypes = useMemo(() => {
    return Array.from(
      new Set(orders.map((order) => order.orderType)),
    ) as OrderType[]
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search filter
        const searchLower = filters.searchQuery.toLowerCase()
        const matchesSearch =
          order.id.toString().includes(filters.searchQuery) ||
          order.guestName?.toLowerCase().includes(searchLower) ||
          order.guestEmail?.toLowerCase().includes(searchLower) ||
          order.guestPhone?.includes(filters.searchQuery) ||
          order.userId?.toLowerCase().includes(searchLower) ||
          order.orderItems.some((item) =>
            item.menuItemName.toLowerCase().includes(searchLower),
          )

        // Status filter
        const matchesStatus =
          filters.statusFilter === 'all' ||
          order.status === filters.statusFilter

        // Payment status filter
        const matchesPaymentStatus =
          filters.paymentStatusFilter === 'all' ||
          order.paymentStatus === filters.paymentStatusFilter

        // Order type filter
        const matchesOrderType =
          filters.selectedOrderTypes.length === 0 ||
          filters.selectedOrderTypes.includes(order.orderType)

        // Customer type filter
        const matchesCustomerType =
          filters.customerTypeFilter === 'all' ||
          (filters.customerTypeFilter === 'member' && !!order.userId) ||
          (filters.customerTypeFilter === 'guest' && !order.userId)

        return (
          matchesSearch &&
          matchesStatus &&
          matchesOrderType &&
          matchesCustomerType &&
          matchesPaymentStatus
        )
      })
      .sort((a, b) => {
        if (!sorting.sortField) {
          // Default: sort by most recent first
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        }
        const modifier = sorting.sortDirection === 'asc' ? 1 : -1
        if (sorting.sortField === 'id') return (a.id - b.id) * modifier
        if (sorting.sortField === 'date') {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return (dateA - dateB) * modifier
        }
        if (sorting.sortField === 'total')
          return (a.totalAmount - b.totalAmount) * modifier
        if (sorting.sortField === 'status')
          return a.status.localeCompare(b.status) * modifier
        return 0
      })
  }, [
    orders,
    filters.searchQuery,
    filters.statusFilter,
    filters.paymentStatusFilter,
    filters.selectedOrderTypes,
    filters.customerTypeFilter,
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
    if (filters.paymentStatusFilter !== 'all') {
      tags.push({
        id: 'payment',
        label: filters.paymentStatusFilter,
        onRemove: () => filters.setPaymentStatusFilter('all'),
      })
    }
    filters.selectedOrderTypes.forEach((type) => {
      tags.push({
        id: `type-${type}`,
        label: type,
        onRemove: () => filters.toggleOrderType(type),
      })
    })
    if (filters.statusFilter !== 'all') {
      tags.push({
        id: 'status',
        label: filters.statusFilter,
        onRemove: () => filters.setStatusFilter('all'),
      })
    }
    if (filters.customerTypeFilter !== 'all') {
      tags.push({
        id: 'customer',
        label: filters.customerTypeFilter === 'member' ? 'Members' : 'Guests',
        icon:
          filters.customerTypeFilter === 'member' ? (
            <User className="h-3 w-3 text-blue-500" />
          ) : (
            <UserCircle className="h-3 w-3 text-orange-500" />
          ),
        onRemove: () => filters.setCustomerTypeFilter('all'),
      })
    }
    return tags
  }, [filters])

  const totalOrders = orders.length

  const orderStatuses = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
  ] as const
  const orderStatusCounts = orderStatuses.reduce<Record<string, number>>(
    (acc, status) => {
      acc[status] = orders.filter((order) => order.status === status).length
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Manage and track all restaurant orders"
      />

      <div className="flex flex-col lg:flex-row gap-6 transition-all duration-300">
        {/* Table Section */}
        <div
          className={cn(
            'transition-all duration-300',
            selectedOrder ? 'lg:w-1/2 w-full' : 'w-full',
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    All Orders ({totalOrders})
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      {orderStatusCounts['PENDING']} Pending
                    </span>
                    {/* <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {orderStatusCounts['CONFIRMED']} Confirmed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      {orderStatusCounts['PREPARING']} Preparing
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {orderStatusCounts['READY']} Ready
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      {orderStatusCounts['OUT_FOR_DELIVERY']} Out for Delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {orderStatusCounts['DELIVERED']} Delivered
                    </span> */}
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {orderStatusCounts['COMPLETED']} Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {orderStatusCounts['CANCELLED']} Cancelled
                    </span>
                  </div>
                </div>
                <Button onClick={() => setIsDineInDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Dine-In Order
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <OrderFilters
                searchQuery={filters.searchQuery}
                onSearchChange={filters.setSearchQuery}
                orderStatusFilter={filters.statusFilter}
                onOrderStatusChange={filters.setStatusFilter}
                paymentStatusFilter={filters.paymentStatusFilter}
                onPaymentStatusChange={filters.setPaymentStatusFilter}
                orderTypes={orderTypes}
                selectedOrderTypes={filters.selectedOrderTypes}
                onToggleOrderType={filters.toggleOrderType}
                onClearOrderTypes={() => filters.setSelectedOrderTypes([])}
                isCompact={!!selectedOrder}
                // customerTypeFilter={filters.customerTypeFilter}
                // onCustomerTypeChange={filters.setCustomerTypeFilter}
              />

              <ActiveFilterTags
                tags={filterTags}
                onClearAll={filters.clearAllFilters}
                resultCount={
                  filters.hasActiveFilters ? filteredOrders.length : undefined
                }
                totalCount={filters.hasActiveFilters ? totalOrders : undefined}
              />

              {isLoading ? (
                <TableLoadingState message="Loading orders..." />
              ) : error ? (
                <TableErrorState
                  error={error}
                  fallbackMessage="Failed to load orders"
                />
              ) : filteredOrders.length === 0 ? (
                <TableEmptyState message="No orders found." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Order"
                        field="id"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <SortableTableHead
                        label="Created Date"
                        field="date"
                        currentSortField={sorting.sortField}
                        currentSortDirection={sorting.sortDirection}
                        onSort={sorting.handleSort}
                      />
                      <TableHead>Type</TableHead>
                      {/* <TableHead>Customer</TableHead> */}
                      <TableHead>Items</TableHead>
                      <SortableTableHead
                        label="Total"
                        field="total"
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
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        isSelected={selectedOrder?.id === order.id}
                        onSelect={() =>
                          setSelectedOrder(
                            selectedOrder?.id === order.id ? null : order,
                          )
                        }
                        onStatusUpdate={handleStatusUpdate}
                        isUpdatingStatus={updateStatusMutation.isPending}
                        onPaymentStatusUpdate={handlePaymentStatusUpdate}
                        isUpdatingPaymentStatus={
                          updatePaymentStatusMutation.isPending
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Card Section */}
        {selectedOrder && (
          <div className="lg:w-1/2 w-full animate-in slide-in-from-right duration-300 max-h-[calc(100vh-12rem)]">
            <OrderDetailsCard
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusUpdate={handleStatusUpdate}
              isUpdatingStatus={updateStatusMutation.isPending}
              onPaymentStatusUpdate={handlePaymentStatusUpdate}
              isUpdatingPaymentStatus={updatePaymentStatusMutation.isPending}
            />
          </div>
        )}
      </div>

      <DineInOrderDialog
        open={isDineInDialogOpen}
        onClose={() => setIsDineInDialogOpen(false)}
        onSubmit={handleCreateDineIn}
        isLoading={createDineInMutation.isPending}
      />
    </div>
  )
}
