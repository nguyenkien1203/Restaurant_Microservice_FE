import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Flame, Leaf, XCircle } from 'lucide-react'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'

interface MenuItemCardProps {
  item: NormalizedMenuItem
  quantity: number
  onSelect: (item: NormalizedMenuItem) => void
  onAddToCart: (item: NormalizedMenuItem) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  isHighlighted?: boolean
}

export function MenuItemCard({
  item,
  quantity,
  onSelect,
  onAddToCart,
  onUpdateQuantity,
  isHighlighted = false,
}: MenuItemCardProps) {
  return (
    <Card
      id={`menu-item-${item.id}`}
      className={`bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
        isHighlighted ? 'ring-1 ring-primary shadow-lg' : ''
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="flex">
        <div className="relative">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-32 h-32 object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-card-foreground">
                {item.name}
              </h3>

              {/* Dietary badges */}
              {item.tags.includes(MENU_TAGS.SPICY) && (
                <span
                  className="bg-red-600 text-white p-1 rounded-full"
                  title="Spicy"
                >
                  <Flame className="h-3 w-3" />
                </span>
              )}
              {item.tags.includes(MENU_TAGS.VEGAN) && (
                <span
                  className="bg-green-600 text-white p-1 rounded-full"
                  title="Vegan"
                >
                  <Leaf className="h-3 w-3" />
                </span>
              )}
              {!item.isAvailable && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                >
                  Out of Stock
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-semibold text-primary">
              ${item.price.toFixed(2)}
            </span>
            {quantity > 0 ? (
              <div
                className="flex items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-medium text-card-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (item.isAvailable) {
                    onAddToCart(item)
                  }
                }}
                disabled={!item.isAvailable}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
