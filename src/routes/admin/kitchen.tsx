import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin'

export const Route = createFileRoute('/admin/kitchen')({
  component: AdminKitchen,
})

function AdminKitchen() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kitchen View"
        description="Monitor and manage kitchen orders"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Kitchen view functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
