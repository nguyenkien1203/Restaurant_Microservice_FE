import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrders,
})

const orders = [
  { id: "#1234", customer: "Table 5", items: 3, total: "$45.50", status: "preparing", time: "10 min ago" },
  { id: "#1235", customer: "Takeaway", items: 2, total: "$28.00", status: "ready", time: "15 min ago" },
  { id: "#1236", customer: "Table 12", items: 5, total: "$89.00", status: "served", time: "25 min ago" },
  { id: "#1237", customer: "Table 3", items: 4, total: "$62.00", status: "preparing", time: "5 min ago" },
  { id: "#1238", customer: "Delivery", items: 2, total: "$35.00", status: "pending", time: "2 min ago" },
  { id: "#1239", customer: "Table 8", items: 6, total: "$120.00", status: "ready", time: "30 min ago" },
  { id: "#1240", customer: "Takeaway", items: 1, total: "$18.50", status: "served", time: "45 min ago" },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-gray-100 text-gray-800",
}

function AdminOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage and track all restaurant orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-card-foreground">{order.id}</span>
                  <span className="text-sm text-muted-foreground">{order.customer}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{order.items} items</span>
                  <span className="font-medium text-card-foreground">{order.total}</span>
                  <Badge className={statusColors[order.status]} variant="secondary">
                    {order.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{order.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
