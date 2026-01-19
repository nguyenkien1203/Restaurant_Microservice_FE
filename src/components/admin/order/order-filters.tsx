import {
  Filter,
  CheckCircle,
  Package2,
  Handbag,
  Clock,
  UtensilsCrossed,
  User,
  UserCircle,
  CreditCard,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  FilterDropdown,
  FilterDropdownHeader,
  FilterDropdownClear,
} from '../filter-dropdown'
import { SearchInput } from '../search-input'
import type { OrderStatus, OrderType, PaymentStatus } from '@/lib/types/order'

export type OrderStatusFilter = 'all' | OrderStatus
export type PaymentStatusFilter = 'all' | PaymentStatus
export type OrderTypeFilter = 'all' | OrderType
export type CustomerTypeFilter = 'all' | 'member' | 'guest'

interface OrderFiltersProps {
  // Search
  searchQuery: string
  onSearchChange: (value: string) => void
  // Order Status
  orderStatusFilter: OrderStatusFilter
  onOrderStatusChange: (status: OrderStatusFilter) => void
  // Payment Status
  paymentStatusFilter: PaymentStatusFilter
  onPaymentStatusChange: (status: PaymentStatusFilter) => void
  // Order Type
  orderTypes: OrderType[]
  selectedOrderTypes: OrderType[]
  onToggleOrderType: (type: OrderType) => void
  onClearOrderTypes: () => void
  // Customer Type
  // customerTypeFilter: CustomerTypeFilter
  // onCustomerTypeChange: (type: CustomerTypeFilter) => void
  // Layout
  isCompact?: boolean
}

const orderStatusConfig: Record<OrderStatus, { label: string; color: string }> =
  {
    PENDING: { label: 'Pending', color: 'bg-yellow-500' },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-500' },
    COMPLETED: { label: 'Completed', color: 'bg-green-500' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-500' },
  }

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500' },
  PAID: { label: 'Paid', color: 'bg-green-500' },
  FAILED: { label: 'Failed', color: 'bg-red-500' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-500' },
}

const orderTypeConfig: Record<
  OrderType,
  { label: string; icon: React.ElementType }
> = {
  DELIVERY: { label: 'Delivery', icon: Package2 },
  TAKEAWAY: { label: 'Takeaway', icon: Handbag },
  PRE_ORDER: { label: 'Pre-Order', icon: Clock },
  DINE_IN: { label: 'Dine In', icon: UtensilsCrossed },
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  orderStatusFilter,
  onOrderStatusChange,
  paymentStatusFilter,
  onPaymentStatusChange,
  orderTypes,
  selectedOrderTypes,
  onToggleOrderType,
  onClearOrderTypes,
  // customerTypeFilter,
  // onCustomerTypeChange,
  isCompact = false,
}: OrderFiltersProps) {
  return (
    <div className={cn('flex gap-3', isCompact ? 'flex-col' : 'flex-row items-center')}>
      <div className={isCompact ? 'w-full' : 'flex-1 min-w-0'}>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search orders by ID, customer name, email..."
          className={isCompact ? '!flex-none !w-full' : ''}
        />
      </div>

      <div className={cn('flex gap-2', isCompact ? 'flex-nowrap overflow-x-auto' : 'flex-nowrap shrink-0')}>
        {/* Order Status Filter */}
        <FilterDropdown
          label="Order Status"
          icon={<CheckCircle className="h-4 w-4" />}
          hasActiveFilters={orderStatusFilter !== 'all'}
        >
          <FilterDropdownHeader>Order Status</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Statuses', color: 'bg-primary' },
              ...Object.entries(orderStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
                color: config.color,
              })),
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onOrderStatusChange(option.value as OrderStatusFilter)
                }
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  orderStatusFilter === option.value && 'bg-accent',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    orderStatusFilter === option.value
                      ? option.color
                      : 'bg-transparent border border-border',
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Payment Status Filter */}
        <FilterDropdown
          label="Payment Status"
          icon={<CreditCard className="h-4 w-4" />}
          hasActiveFilters={paymentStatusFilter !== 'all'}
        >
          <FilterDropdownHeader>Payment Status</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Statuses', color: 'bg-primary' },
              ...Object.entries(paymentStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
                color: config.color,
              })),
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onPaymentStatusChange(option.value as PaymentStatusFilter)
                }
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  paymentStatusFilter === option.value && 'bg-accent',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    paymentStatusFilter === option.value
                      ? option.color
                      : 'bg-transparent border border-border',
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Order Type Filter */}
        <FilterDropdown
          label="Order Type"
          icon={<Filter className="h-4 w-4" />}
          hasActiveFilters={selectedOrderTypes.length > 0}
        >
          <FilterDropdownHeader>Order Types</FilterDropdownHeader>
          <div className="max-h-64 overflow-y-auto">
            {orderTypes.map((type) => {
              const config = orderTypeConfig[type]
              const Icon = config?.icon || Package2
              return (
                <label
                  key={type}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedOrderTypes.includes(type)}
                    onCheckedChange={() => onToggleOrderType(type)}
                  />
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{config?.label || type}</span>
                  </div>
                </label>
              )
            })}
          </div>
          <FilterDropdownClear
            onClear={onClearOrderTypes}
            show={selectedOrderTypes.length > 0}
          />
        </FilterDropdown>

        {/* Customer Type Filter */}
        {/* <FilterDropdown
          label="Customer"
          icon={<User className="h-4 w-4" />}
          hasActiveFilters={customerTypeFilter !== 'all'}
        >
          <FilterDropdownHeader>Customer Type</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Customers', icon: null },
              { value: 'member', label: 'Members', icon: User },
              { value: 'guest', label: 'Guests', icon: UserCircle },
            ].map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    onCustomerTypeChange(option.value as CustomerTypeFilter)
                  }
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                    customerTypeFilter === option.value && 'bg-accent',
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  {option.label}
                </button>
              )
            })}
          </div>
        </FilterDropdown> */}
      </div>
    </div>
  )
}
