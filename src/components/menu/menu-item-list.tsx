import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
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
}

export function MenuItemList({
  items,
  isLoading,
  error,
  getItemQuantity,
  onItemSelect,
  onAddToCart,
  onUpdateQuantity,
}: MenuItemListProps) {
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
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">
            Failed to load menu. Please try again later.
          </p>
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
        />
      ))}
    </div>
  )
}
