'use client'

import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  UserCog,
  ChevronDown,
  Shield,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouterState()
  const navigate = useNavigate()
  const pathname = router.location.pathname
  const { user, isAuthenticated, logout, isAdmin } = useAuth()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/reservation', label: 'Reservations' },
    { to: '/order', label: 'Order Online' },
    { to: '/about', label: 'About' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-sm">
                A
              </span>
            </div>
            <span className="font-semibold text-foreground">
              Aperture Dining
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as '/'}
                className={cn(
                  'text-sm transition-colors',
                  isActive(link.to)
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-accent cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.fullName?.charAt(0)?.toUpperCase() ||
                        user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[150px] truncate">
                    {user.fullName || user.email}
                  </span>
                  {isAdmin() && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                      Admin
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      dropdownOpen && 'rotate-180',
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="font-medium text-foreground truncate">
                        {user.fullName || 'Guest'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      search={{ tab: 'dashboard' }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      search={{ tab: 'reservations' }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Reservations
                    </Link>
                    <Link
                      to="/profile"
                      search={{ tab: 'orders' }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Order History
                    </Link>
                    <Link
                      to="/profile"
                      search={{ tab: 'settings' }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <UserCog className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    {isAdmin() && (
                      <>
                        <div className="border-t border-border mt-1 pt-1" />
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Shield className="h-4 w-4 text-amber-500" />
                          <span className="flex items-center gap-2">
                            Admin Panel
                            <span className="text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          </span>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to={'/login' as '/'}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to={'/signup' as '/'}>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to as '/'}
                  className={cn(
                    'text-sm transition-colors',
                    isActive(link.to)
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.fullName?.charAt(0)?.toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {user.fullName || 'Guest'}
                          </p>
                          {isAdmin() && (
                            <span className="text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      search={{ tab: 'dashboard' }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-muted-foreground py-2 hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      search={{ tab: 'orders' }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-muted-foreground py-2 hover:text-foreground"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Order History
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-sm text-muted-foreground py-2 hover:text-foreground"
                      >
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span className="flex items-center gap-2">
                          Admin Panel
                          <span className="text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        </span>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to={'/login' as '/'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link
                      to={'/signup' as '/'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                    <Link
                      to={'/reservation' as '/'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground"
                      >
                        Book a Table
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
