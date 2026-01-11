import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin'

export const Route = createFileRoute('/admin/staff')({
  component: AdminStaff,
})

function AdminStaff() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Staff Management"
        description="Manage restaurant staff members"
      />

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Staff management functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
