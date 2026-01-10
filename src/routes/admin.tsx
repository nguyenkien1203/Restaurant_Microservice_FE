import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAuth } from '@/lib/auth-context'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isLoading, isAuthenticated, navigate])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message for non-admin users
  if (isAuthenticated && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin area. This section is
            restricted to administrators only.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go to Home
            </Button>
            <Button onClick={() => navigate({ to: '/profile' })}>
              My Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  )
}
