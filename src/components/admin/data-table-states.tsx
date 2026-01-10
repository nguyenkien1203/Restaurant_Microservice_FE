import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function TableLoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">{message}</span>
    </div>
  )
}

interface ErrorStateProps {
  error: Error | null | unknown
  fallbackMessage?: string
}

export function TableErrorState({
  error,
  fallbackMessage = 'Failed to load data',
}: ErrorStateProps) {
  const message = error instanceof Error ? error.message : fallbackMessage

  return (
    <div className="text-center py-12">
      <p className="text-destructive">{message}</p>
    </div>
  )
}

interface EmptyStateProps {
  message?: string
}

export function TableEmptyState({
  message = 'No items found.',
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
