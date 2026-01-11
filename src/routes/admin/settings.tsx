import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin'

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
})

function AdminSettings() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="App settings & preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
