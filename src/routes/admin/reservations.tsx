import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/reservations')({
  component: AdminReservations,
})

function AdminReservations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
        <p className="text-muted-foreground mt-2">Manage table reservations</p>
      </div>

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
