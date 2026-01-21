import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserCog,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getMyProfile } from '@/lib/api/profile'
import { getMyOrders } from '@/lib/api/order'
import {
  PageSidebar,
  PageWithSidebar,
  type SidebarItem,
} from '@/components/profile/profile-sidebar'
import {
  DashboardTab,
  OrderHistoryTab,
  ReservationsTab,
  ProfileSettingsTab,
  AddressesTab,
  PaymentMethodsTab,
} from '@/components/profile'

type TabType =
  | 'dashboard'
  | 'reservations'
  | 'orders'
  | 'settings'
  // | 'addresses'
  // | 'payment'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  validateSearch: (search: Record<string, unknown>): { tab?: TabType } => {
    const validTabs: TabType[] = [
      'dashboard',
      'reservations',
      'orders',
      'settings',
      // 'addresses',
      // 'payment',
    ]
    const tab = search.tab as TabType | undefined
    return {
      tab: tab && validTabs.includes(tab) ? tab : undefined,
    }
  },
})

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'orders', label: 'Order History', icon: ClipboardList },
  { id: 'settings', label: 'Profile Settings', icon: UserCog },
  // { id: 'addresses', label: 'Addresses', icon: MapPin },
  // { id: 'payment', label: 'Payment Methods', icon: CreditCard },
]

function ProfilePage() {
  const navigate = useNavigate()
  const { tab: urlTab } = useSearch({ from: '/profile' })
  const { user, logout, isAuthenticated, updateUser, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || 'dashboard')

  // Sync URL tab with state
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [urlTab, activeTab])

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    const tab = tabId as TabType
    setActiveTab(tab)
    navigate({ to: '/profile', search: { tab } })
  }

  // Fetch profile data from API
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch orders from API
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: getMyOrders,
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  })

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, user, navigate])

  // Sync profile data with auth context
  useEffect(() => {
    if (profile && user) {
      if (profile.fullName !== user.fullName || profile.email !== user.email) {
        updateUser({
          fullName: profile.fullName,
          email: profile.email,
        })
      }
    }
  }, [profile, user, updateUser])

  if (!isAuthenticated || !user) {
    return null
  }

  const displayName = profile?.fullName || user.fullName || 'Guest User'
  const displayEmail = profile?.email || user.email
  const firstName = displayName.split(' ')[0]

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const sidebar = (
    <PageSidebar
      userName={displayName}
      userSubtitle={isAdmin() ? 'Administrator' : 'Dining Member'}
      isAdmin={isAdmin()}
      items={sidebarItems}
      activeItemId={activeTab}
      onItemClick={handleTabChange}
      showAdminLink={isAdmin()}
      onLogout={handleLogout}
      variant="default"
    />
  )

  return (
    <PageWithSidebar sidebar={sidebar}>
      {/* Error Banner */}
      {profileError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm text-destructive">
              Failed to load profile data. Some information may be outdated.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchProfile()}
            className="border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <DashboardTab
          firstName={firstName}
          orders={orders}
          isOrdersLoading={isOrdersLoading}
          loyaltyPoints={profile?.loyaltyPoints ?? 0}
          membershipRank={profile?.membershipRank ?? 'SILVER'}
        />
      )}

      {activeTab === 'reservations' && <ReservationsTab />}

      {activeTab === 'orders' && (
        <OrderHistoryTab
          orders={orders}
          isLoading={isOrdersLoading}
          error={ordersError}
          onRetry={refetchOrders}
        />
      )}

      {activeTab === 'settings' && (
        <ProfileSettingsTab
          profile={profile}
          email={displayEmail}
          fullName={displayName}
          onProfileUpdate={() => refetchProfile()}
        />
      )}

      {/* {activeTab === 'addresses' && <AddressesTab address={profile?.address} />}

      {activeTab === 'payment' && <PaymentMethodsTab />} */}
    </PageWithSidebar>
  )
}
