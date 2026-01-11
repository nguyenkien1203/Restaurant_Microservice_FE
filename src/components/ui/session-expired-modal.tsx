import { useNavigate } from '@tanstack/react-router'
import { Clock, LogIn } from 'lucide-react'
import { Button } from './button'
import { useAuth } from '@/lib/auth-context'

export function SessionExpiredModal() {
  const navigate = useNavigate()
  const { sessionExpired, dismissSessionExpired } = useAuth()

  if (!sessionExpired) return null

  const handleLogin = () => {
    dismissSessionExpired()
    navigate({ to: '/login' })
  }

  const handleDismiss = () => {
    dismissSessionExpired()
    navigate({ to: '/' })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-card border border-border shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center">
            Session Expired
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <p className="text-muted-foreground">
            Your session has expired. Please log in again to continue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 p-6 border-t border-border">
          <Button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Log In Again
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
