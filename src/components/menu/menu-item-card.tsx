import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Flame, Leaf } from 'lucide-react'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'

interface MenuItemCardProps {
  item: NormalizedMenuItem
  quantity: number
  onSelect: (item: NormalizedMenuItem) => void
  onAddToCart: (item: NormalizedMenuItem) => void
  onUpdateQuantity: (id: string, quantity: number) => void
}

export function MenuItemCard({
  item,
  quantity,
  onSelect,
  onAddToCart,
  onUpdateQuantity,
}: MenuItemCardProps) {
  return (
    <Card
      className="bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(item)}
    >
      <div className="flex">
        <div className="relative">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-32 h-32 object-cover"
          />
          {/* Dietary badges on image */}
          <div className="absolute top-1 left-1 flex gap-1">
            {item.tags.includes(MENU_TAGS.SPICY) && (
              <span
                className="bg-red-500 text-white p-1 rounded-full"
                title="Spicy"
              >
                <Flame className="h-3 w-3" />
              </span>
            )}
            {item.tags.includes(MENU_TAGS.VEGAN) && (
              <span
                className="bg-green-500 text-white p-1 rounded-full"
                title="Vegan"
              >
                <Leaf className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-card-foreground">{item.name}</h3>
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
                  onAddToCart(item)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
