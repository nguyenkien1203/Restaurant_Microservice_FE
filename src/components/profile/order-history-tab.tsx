import { OrderList } from '@/components/order/order-list'
import type { Order } from '@/lib/types/order'

interface OrderHistoryTabProps {
  orders: Order[]
  isLoading: boolean
  error?: Error | null
  onRetry?: () => void
}

export function OrderHistoryTab({
  orders,
  isLoading,
  error,
  onRetry,
}: OrderHistoryTabProps) {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
        Order History
      </h1>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        compact={false}
        getDetailsLink={(order) => `/orders/${order.id}`}
        emptyState={{
          title: 'No orders found',
          description:
            "You haven't placed any orders yet. Start exploring our menu!",
          action: {
            label: 'Browse Menu',
            href: '/menu',
          },
        }}
      />
    </div>
  )
}
