import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin'

export const Route = createFileRoute('/admin/analytics')({
  component: AdminAnalytics,
})

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Analytics" description="View detailed analytics and reports" />

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
