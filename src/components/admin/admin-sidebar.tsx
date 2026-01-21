import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  HomeIcon,
  UtensilsCrossed,
  Calendar,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Shield,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getMyProfile } from '@/lib/api/profile'

const navItems = [
  { href: '/admin', icon: HomeIcon, label: 'Dashboard' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Management' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/reservations', icon: Calendar, label: 'Reservations' },
  { href: '/admin/tables', icon: LayoutGrid, label: 'Tables' },
  // { href: '/admin/kitchen', icon: ChefHat, label: 'Kitchen View' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  // { href: '/admin/staff', icon: Users, label: 'Staff' },
  // { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  // { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const router = useRouterState()
  const navigate = useNavigate()
  const pathname = router.location.pathname
  const { user, logout } = useAuth()

  // Fetch current profile to get the latest fullName (in case it was updated)
  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: getMyProfile,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Consider fresh for 30 seconds
  })

  // Use profile fullName if available, otherwise fall back to auth context
  const displayName =
    profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Admin'
  const displayInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col sticky top-0 shrink-0">
      {/* Admin Profile Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <span className="text-amber-500 font-bold text-lg">
              {displayInitial}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-sidebar-foreground">
              {displayName}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-amber-500">
              <Shield className="h-3 w-3" />
              Aperture Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
