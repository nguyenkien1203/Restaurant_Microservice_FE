import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin'

export const Route = createFileRoute('/admin/customers')({
  component: AdminCustomers,
})

function AdminCustomers() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Manage Aperture customer information"
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Customer management functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
