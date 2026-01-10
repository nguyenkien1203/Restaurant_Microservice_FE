import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full max-h-[90vh] overflow-auto rounded-lg bg-card border border-border shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps {
  children: ReactNode
  onClose?: () => void
  className?: string
}

export function DialogHeader({
  children,
  onClose,
  className,
}: DialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 border-b border-border',
        className,
      )}
    >
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1', className)}>
      {children}
    </p>
  )
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>
}

interface DialogFooterProps {
  children: ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6 border-t border-border',
        className,
      )}
    >
      {children}
    </div>
  )
}
