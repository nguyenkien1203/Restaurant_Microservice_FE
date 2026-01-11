import { Link } from '@tanstack/react-router'
import { LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
}

export interface SidebarConfig {
  /** User display name */
  userName: string
  /** User subtitle (e.g., "Dining Member" or "Administrator") */
  userSubtitle: string
  /** Whether the user is an admin */
  isAdmin?: boolean
  /** Main navigation items */
  items: SidebarItem[]
  /** Currently active item ID */
  activeItemId: string
  /** Callback when item is clicked */
  onItemClick?: (id: string) => void
  /** Show admin panel link */
  showAdminLink?: boolean
  /** Logout handler */
  onLogout?: () => void
  /** Style variant */
  variant?: 'default' | 'admin'
}

export function PageSidebar({
  userName,
  userSubtitle,
  isAdmin = false,
  items,
  activeItemId,
  onItemClick,
  showAdminLink = false,
  onLogout,
  variant = 'default',
}: SidebarConfig) {
  const isAdminVariant = variant === 'admin'

  // Colors based on variant
  const activeItemClass = isAdminVariant
    ? 'bg-amber-500/10 text-amber-600'
    : 'bg-primary/10 text-primary'

  const avatarClass = isAdminVariant
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
    : 'bg-primary/10 border-primary/20 text-primary'

  const subtitleClass = isAdminVariant ? 'text-amber-600' : 'text-primary'

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col sticky top-16 h-[calc(100vh-4rem)] shrink-0">
      {/* User Profile Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg border-2 flex items-center justify-center',
              avatarClass,
            )}
          >
            <span className="text-xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{userName}</h3>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                <Shield className="h-3.5 w-3.5" />
                {userSubtitle}
              </span>
            ) : (
              <p className={cn('text-sm', subtitleClass)}>{userSubtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItemId === item.id

            // If item has href, render as Link
            if (item.href) {
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? activeItemClass
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            }

            // Otherwise render as button
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    item.onClick?.()
                    onItemClick?.(item.id)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    isActive
                      ? activeItemClass
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            )
          })}

          {/* Admin Panel Link */}
          {showAdminLink && (
            <li className="pt-2 mt-2 border-t border-border">
              <Link
                to="/admin"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-amber-600 hover:bg-amber-500/10"
              >
                <Shield className="h-5 w-5" />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </aside>
  )
}

/** Layout wrapper with sidebar and main content */
export function PageWithSidebar({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted">
      {sidebar}
      <main className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  )
}
