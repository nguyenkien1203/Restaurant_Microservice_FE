import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/kitchen')({
  component: AdminKitchen,
})

function AdminKitchen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kitchen View</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage kitchen orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Kitchen view functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
