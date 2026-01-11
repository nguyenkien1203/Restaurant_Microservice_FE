import { createFileRoute } from '@tanstack/react-router'
import { StatCard } from '@/components/admin/stat-card'
import { OrderList } from '@/components/admin/order-list'
import { SalesChart } from '@/components/admin/sales-chart'
import { QuickActionButton } from '@/components/admin/quick-action-button'
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Admin'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}! Here's what's happening at your restaurant today.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$12,450"
          change="+12.5% from last month"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Orders Today"
          value="142"
          change="+8.2% from yesterday"
          changeType="positive"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          title="Active Customers"
          value="1,234"
          change="+5.1% from last week"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Growth Rate"
          value="18.2%"
          change="+2.3% from last month"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickActionButton
            icon={<Plus className="h-6 w-6" />}
            label="New Order"
            onClick={() => console.log('New Order')}
          />
          <QuickActionButton
            icon={<Edit className="h-6 w-6" />}
            label="Edit Menu"
            onClick={() => console.log('Edit Menu')}
          />
          <QuickActionButton
            icon={<Users className="h-6 w-6" />}
            label="Manage Staff"
            onClick={() => console.log('Manage Staff')}
          />
          <QuickActionButton
            icon={<Settings className="h-6 w-6" />}
            label="Settings"
            onClick={() => console.log('Settings')}
          />
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <OrderList />
      </div>
    </div>
  )
}
