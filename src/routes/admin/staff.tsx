import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/staff')({
  component: AdminStaff,
})

function AdminStaff() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-2">Manage restaurant staff members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Staff management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
