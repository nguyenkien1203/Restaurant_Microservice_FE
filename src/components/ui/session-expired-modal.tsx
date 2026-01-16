import { useNavigate } from '@tanstack/react-router'
import { Clock, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { PopupModal } from './popup-modal'

export function SessionExpiredModal() {
  const navigate = useNavigate()
  const { sessionExpired, dismissSessionExpired } = useAuth()

  const handleLogin = () => {
    dismissSessionExpired()
    navigate({ to: '/login' })
  }

  const handleDismiss = () => {
    dismissSessionExpired()
    navigate({ to: '/' })
  }

  return (
    <PopupModal
      open={sessionExpired}
      onClose={dismissSessionExpired}
      title="Session Expired"
      description="Your session has expired. Please log in again to continue."
      icon={Clock}
      iconColor="text-amber-500"
      iconBgColor="bg-amber-500/10"
      primaryButtonText="Log In Again"
      primaryButtonAction={handleLogin}
      secondaryButtonText="Return to Home"
      secondaryButtonAction={handleDismiss}
      showCloseButton={true}
      primaryButtonIcon={LogIn}
    />
  )
}
