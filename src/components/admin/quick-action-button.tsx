import type React from "react"
import { Button } from "@/components/ui/button"

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

export function QuickActionButton({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="flex flex-col items-center gap-2 h-auto py-4 px-6 bg-card hover:bg-accent"
      onClick={onClick}
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Button>
  )
}
