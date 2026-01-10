import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserCog,
  MapPin,
  CreditCard,
  LogOut,
  CalendarX2,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getMyProfile } from '@/lib/api/profile'
import type { UserProfile } from '@/lib/types/profile'

type TabType =
  | 'dashboard'
  | 'reservations'
  | 'orders'
  | 'settings'
  | 'addresses'
  | 'payment'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  validateSearch: (search: Record<string, unknown>): { tab?: TabType } => {
    const validTabs: TabType[] = [
      'dashboard',
      'reservations',
      'orders',
      'settings',
      'addresses',
      'payment',
    ]
    const tab = search.tab as TabType | undefined
    return {
      tab: tab && validTabs.includes(tab) ? tab : undefined,
    }
  },
})

interface SidebarItem {
  id: TabType
  label: string
  icon: React.ElementType
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'orders', label: 'Order History', icon: ClipboardList },
  { id: 'settings', label: 'Profile Settings', icon: UserCog },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
]

// Mock data for demonstration (orders will be fetched from API later)
const mockOrders = [
  {
    id: '#11032',
    date: 'October 24th, 2023',
    total: '$45.50',
    status: 'Delivered',
    image: '/elegant-restaurant-interior-with-warm-lighting-and.jpg',
  },
  {
    id: '#10998',
    date: 'October 15th, 2023',
    total: '$62.00',
    status: 'Delivered',
    image: '/elegant-restaurant-interior-with-warm-lighting-and.jpg',
  },
]

function ProfilePage() {
  const navigate = useNavigate()
  const { tab: urlTab } = useSearch({ from: '/profile' })
  const { user, logout, isAuthenticated, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || 'dashboard')

  // Sync URL tab with state
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [urlTab])

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mock loyalty points (can be fetched from API later)
  const loyaltyPoints = 1280
  const nextRewardPoints = 2000
  const progressPercentage = (loyaltyPoints / nextRewardPoints) * 100

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, user, navigate])

  // Auto-logout if API returns 401 (session expired)
  useEffect(() => {
    if (
      profileError &&
      'statusCode' in profileError &&
      profileError.statusCode === 401
    ) {
      // Session expired - clear local state and redirect to login
      logout()
      navigate({ to: '/login' })
    }
  }, [profileError, logout, navigate])

  // Sync profile data with auth context (updates navbar display name)
  useEffect(() => {
    if (profile && user) {
      // Only update if the data is different to avoid infinite loops
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

  // Use profile data if available, fallback to auth user data
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted">
      {/* Sidebar - Fixed position, full height */}
      <aside className="w-64 bg-card border-r border-border flex flex-col sticky top-16 h-[calc(100vh-4rem)] shrink-0">
        {/* User Profile Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <p className="text-sm text-primary">Loyalty Member</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
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
          <DashboardContent
            firstName={firstName}
            loyaltyPoints={loyaltyPoints}
            nextRewardPoints={nextRewardPoints}
            progressPercentage={progressPercentage}
            orders={mockOrders}
          />
        )}
        {activeTab === 'reservations' && <ReservationsContent />}
        {activeTab === 'orders' && <OrderHistoryContent orders={mockOrders} />}
        {activeTab === 'settings' && (
          <ProfileSettingsContent
            profile={profile}
            email={displayEmail}
            fullName={displayName}
          />
        )}
        {activeTab === 'addresses' && (
          <AddressesContent address={profile?.address} />
        )}
        {activeTab === 'payment' && <PaymentMethodsContent />}
      </main>
    </div>
  )
}

// Dashboard Tab Content
function DashboardContent({
  firstName,
  loyaltyPoints,
  nextRewardPoints,
  progressPercentage,
  orders,
}: {
  firstName: string
  loyaltyPoints: number
  nextRewardPoints: number
  progressPercentage: number
  orders: typeof mockOrders
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's a summary of your account.
          </p>
        </div>
        <Link to="/reservation">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <CalendarDays className="h-4 w-4 mr-2" />
            Book a Table
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Loyalty Points Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Loyalty Points
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-4xl font-bold text-primary">
                  {loyaltyPoints.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-2">points</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Reward</span>
                  <span className="text-muted-foreground">
                    {nextRewardPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  You're {nextRewardPoints - loyaltyPoints} points away from a
                  free dessert!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarX2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No upcoming reservations
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have any tables booked at the moment. Time to plan your
              next delicious meal?
            </p>
            <Link to="/menu">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
              >
                Explore our Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-0">
                <div className="flex items-center gap-6">
                  <div className="w-40 h-32 bg-muted rounded-l-xl overflow-hidden flex-shrink-0">
                    <img
                      src={order.image}
                      alt={`Order ${order.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 py-4">
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Order {order.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {order.total}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button
                        size="sm"
                        className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      >
                        Reorder
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Reservations Tab Content
function ReservationsContent() {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
        My Reservations
      </h1>
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarX2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No reservations found
          </h3>
          <p className="text-muted-foreground mb-6">
            You haven't made any reservations yet.
          </p>
          <Link to="/reservation">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Book a Table
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// Order History Tab Content
function OrderHistoryContent({ orders }: { orders: typeof mockOrders }) {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
        Order History
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-0">
              <div className="flex items-center gap-6">
                <div className="w-40 h-32 bg-muted rounded-l-xl overflow-hidden flex-shrink-0">
                  <img
                    src={order.image}
                    alt={`Order ${order.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 py-4">
                  <div className="flex items-start justify-between pr-6">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Order {order.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: {order.total}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      Reorder
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Profile Settings Tab Content
function ProfileSettingsContent({
  profile,
  email,
  fullName,
}: {
  profile?: UserProfile
  email: string
  fullName: string
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
        Profile Settings
      </h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-3xl font-semibold text-primary">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {fullName}
              </h3>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Full Name</p>
                <p className="text-sm text-muted-foreground">{fullName}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Phone Number</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.phone || 'Not set'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.address || 'Not set'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Account Information
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Addresses Tab Content
function AddressesContent({ address }: { address?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          My Addresses
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add New Address
        </Button>
      </div>

      {address ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Primary Address</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              No addresses saved
            </h3>
            <p className="text-muted-foreground">
              Add an address for faster delivery checkout.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Payment Methods Tab Content
function PaymentMethodsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          Payment Methods
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add Payment Method
        </Button>
      </div>
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No payment methods
          </h3>
          <p className="text-muted-foreground">
            Add a payment method for faster checkout.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
