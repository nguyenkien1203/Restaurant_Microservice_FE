import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
