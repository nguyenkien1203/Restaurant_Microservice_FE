import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Flame, Leaf, Clock, Zap, XCircle } from 'lucide-react'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'

interface MenuItemDetailModalProps {
  item: NormalizedMenuItem
  onClose: () => void
  onAddToCart: (item: NormalizedMenuItem) => void
}

export function MenuItemDetailModal({
  item,
  onClose,
  onAddToCart,
}: MenuItemDetailModalProps) {
  const handleAddToCart = () => {
    if (item.isAvailable) {
      onAddToCart(item)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="bg-card max-w-lg w-full max-h-[90vh] overflow-auto pt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <CardContent className="px-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-card-foreground">
                  {item.name}
                </h2>
                {!item.isAvailable && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-xl font-bold text-primary">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <p className="text-muted-foreground mb-4">{item.description}</p>

          {/* Item details */}
          <div className="flex gap-8 mb-6">
            {item.tags.includes(MENU_TAGS.SPICY) && (
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Spicy
              </span>
            )}
            {item.tags.includes(MENU_TAGS.VEGAN) && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Vegan
              </span>
            )}
            {item.calories && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">
                  {item.calories} calories
                </span>
              </div>
            )}
            {item.preparationTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  {item.preparationTime} min prep
                </span>
              </div>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
