import { Clock, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface PopupModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  primaryButtonText?: string
  primaryButtonAction?: () => void
  secondaryButtonText?: string
  secondaryButtonAction?: () => void
  showCloseButton?: boolean
  primaryButtonIcon?: LucideIcon
}

export function PopupModal({
  open,
  onClose,
  title,
  description,
  icon: Icon = Clock,
  iconColor = 'text-amber-500',
  iconBgColor = 'bg-amber-500/10',
  primaryButtonText = 'Confirm',
  primaryButtonAction,
  secondaryButtonText = 'Cancel',
  secondaryButtonAction,
  showCloseButton = false,
  primaryButtonIcon: PrimaryIcon,
}: PopupModalProps) {
  if (!open) return null

  const handlePrimary = () => {
    if (primaryButtonAction) {
      primaryButtonAction()
    }
    onClose()
  }

  const handleSecondary = () => {
    if (secondaryButtonAction) {
      secondaryButtonAction()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card border border-border shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 relative">
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div
            className={`h-16 w-16 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}
          >
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 p-6 border-t border-border">
          {primaryButtonText && (
            <Button
              onClick={handlePrimary}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {PrimaryIcon && <PrimaryIcon className="h-4 w-4 mr-2" />}
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonText && (
            <Button
              variant="outline"
              onClick={handleSecondary}
              className="w-full"
            >
              {secondaryButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
