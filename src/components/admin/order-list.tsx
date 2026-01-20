import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/lib/types/order"
import { cn } from "@/lib/utils"

interface OrderListProps {
  orders: Order[]
  isLoading?: boolean
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return "Unknown"
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

function getCustomerLabel(order: Order): string {
  if (order.orderType === "DINE_IN") {
    return "Dine-in"
  }
  if (order.orderType === "TAKEAWAY") return "Takeaway"
  if (order.orderType === "DELIVERY") return "Delivery"
  if (order.orderType === "PRE_ORDER") return "Pre-order"
  return order.guestName || order.guestEmail || "Customer"
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function OrderList({ orders, isLoading }: OrderListProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-card-foreground">Recent Orders</CardTitle>
        <Link to="/admin/orders" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent orders
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium text-card-foreground">#{order.id}</span>
                  <span className="text-sm text-muted-foreground">{getCustomerLabel(order)}</span>
                  <span className="text-sm text-muted-foreground">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                  <span className="font-medium text-card-foreground">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <Badge 
                    className={cn(statusColors[order.status], "pointer-events-none hover:none")} 
                    variant="secondary"
                  >
                    {formatStatus(order.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(order.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
