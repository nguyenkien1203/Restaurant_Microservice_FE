import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
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
import { getMyProfile, getAllProfiles } from '@/lib/api/profile'
import { getAdminOrders } from '@/lib/api/order'
import type { Order } from '@/lib/types/order'
import { APP_TIMEZONE, getTodayInAppTimezone } from '@/lib/utils'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { user } = useAuth()

  // Fetch current profile to get the latest fullName (in case it was updated)
  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: getMyProfile,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Consider fresh for 30 seconds
  })

  // Fetch all orders for dashboard stats
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: getAdminOrders,
    enabled: !!user,
    staleTime: 30000, // Consider fresh for 30 seconds
  })

  // Fetch all profiles for customer count
  const { data: profiles = [] } = useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: getAllProfiles,
    enabled: !!user,
    staleTime: 60000, // Consider fresh for 1 minute
  })

  // Calculate stats from real data
  const stats = useMemo(() => {
    const todayStr = getTodayInAppTimezone()
    const todayDate = new Date(todayStr + 'T00:00:00')
    // Get yesterday's date string in UTC+7
    const yesterdayDate = new Date(todayDate)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
    const yesterdayStartDate = new Date(yesterdayStr + 'T00:00:00')

    // Filter orders by date (comparing date strings in UTC+7)
    const todayOrders = orders.filter((order) => {
      if (!order.createdAt) return false
      const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
      return orderDateStr === todayStr
    })

    const yesterdayOrders = orders.filter((order) => {
      if (!order.createdAt) return false
      const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
      return orderDateStr === yesterdayStr
    })

    // Calculate revenue (only paid orders)
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const todayRevenue = todayOrders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const yesterdayRevenue = yesterdayOrders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate growth rates
    const revenueGrowth =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
          ? 100
          : 0

    const ordersGrowth =
      yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
        : todayOrders.length > 0
          ? 100
          : 0

    // Get unique customers (users with orders)
    const uniqueCustomers = new Set<string>()
    orders.forEach((order) => {
      if (order.userId) {
        uniqueCustomers.add(order.userId)
      } else if (order.guestEmail) {
        uniqueCustomers.add(order.guestEmail)
      }
    })

    // Calculate overall growth rate (average of revenue and orders growth)
    const overallGrowth = (revenueGrowth + ordersGrowth) / 2

    return {
      totalRevenue,
      todayOrders: todayOrders.length,
      yesterdayOrders: yesterdayOrders.length,
      ordersGrowth,
      activeCustomers: uniqueCustomers.size,
      totalProfiles: profiles.length,
      revenueGrowth,
      overallGrowth,
    }
  }, [orders, profiles])

  // Use profile fullName if available, otherwise fall back to auth context
  const displayName =
    profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Admin'
  const firstName = displayName.split(' ')[0]

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format percentage
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Get recent orders (last 5, sorted by most recent)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [orders])

  // Calculate order type distribution for chart
  const orderTypeData = useMemo(() => {
    const typeCounts = {
      DINE_IN: 0,
      TAKEAWAY: 0,
      DELIVERY: 0,
      PRE_ORDER: 0,
    }

    orders.forEach((order) => {
      if (order.orderType in typeCounts) {
        typeCounts[order.orderType as keyof typeof typeCounts]++
      }
    })

    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0)

    return {
      dineIn: typeCounts.DINE_IN,
      takeaway: typeCounts.TAKEAWAY,
      delivery: typeCounts.DELIVERY,
      preOrder: typeCounts.PRE_ORDER,
      total,
    }
  }, [orders])

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
          value={formatCurrency(stats.totalRevenue)}
          // change={`${formatPercent(stats.revenueGrowth)} from yesterday`}
          // changeType={stats.revenueGrowth >= 0 ? 'positive' : 'negative'}
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={ordersLoading}
        />
        <StatCard
          title="Growth Rate"
          value={formatPercent(stats.overallGrowth)}
          change="Today vs yesterday"
          changeType={stats.overallGrowth >= 0 ? 'positive' : 'negative'}
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={ordersLoading}
        />
        <StatCard
          title="Orders Today"
          value={stats.todayOrders.toString()}
          change={`${formatPercent(stats.ordersGrowth)} from yesterday`}
          changeType={stats.ordersGrowth >= 0 ? 'positive' : 'negative'}
          icon={<ShoppingBag className="h-5 w-5" />}
          isLoading={ordersLoading}
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          change={`${stats.totalProfiles} total registered users`}
          changeType="neutral"
          icon={<Users className="h-5 w-5" />}
          isLoading={ordersLoading}
        />
      </div>

      {/* Quick Actions */}
      {/* <div>
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
      </div> */}

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          dineIn={orderTypeData.dineIn}
          takeaway={orderTypeData.takeaway}
          delivery={orderTypeData.delivery}
          preOrder={orderTypeData.preOrder}
          total={orderTypeData.total}
          isLoading={ordersLoading}
        />
        <OrderList orders={recentOrders} isLoading={ordersLoading} />
      </div>
    </div>
  )
}
