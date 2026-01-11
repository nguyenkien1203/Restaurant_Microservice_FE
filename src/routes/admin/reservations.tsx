import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export const Route = createFileRoute('/admin/reservations')({
  component: AdminReservations,
})

function AdminReservations() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reservations"
        description="Manage table reservations"
      />

      <Card>
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reservation management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
