import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description: string
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
  }
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
