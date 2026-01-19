import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MenuItemCard } from './menu-item-card'

interface MenuItemListProps {
  items: NormalizedMenuItem[]
  isLoading: boolean
  error: Error | null
  getItemQuantity: (id: string) => number
  onItemSelect: (item: NormalizedMenuItem) => void
  onAddToCart: (item: NormalizedMenuItem) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onRetry?: () => void
  highlightItemId?: string | null
  onHighlightComplete?: () => void
}

export function MenuItemList({
  items,
  isLoading,
  error,
  getItemQuantity,
  onItemSelect,
  onAddToCart,
  onUpdateQuantity,
  onRetry,
  highlightItemId,
  onHighlightComplete,
}: MenuItemListProps) {
  useEffect(() => {
    if (!highlightItemId) return

    const target = document.getElementById(`menu-item-${highlightItemId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const timeout = window.setTimeout(() => {
      onHighlightComplete?.()
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [highlightItemId, items, onHighlightComplete])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading menu...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Unable to Load Menu
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We're having trouble loading our menu. Please check your
                connection and try again.
              </p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="mt-2"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No items found in this category.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          quantity={getItemQuantity(item.id)}
          onSelect={onItemSelect}
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          isHighlighted={highlightItemId === item.id}
        />
      ))}
    </div>
  )
}
