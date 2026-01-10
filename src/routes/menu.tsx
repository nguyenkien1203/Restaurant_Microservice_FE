import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CartSidebar } from '@/components/order/cart-sidebar'
import { fetchMenuItems } from '@/lib/api/menu'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'
import { cn } from '../lib/utils'
import { Plus, Minus, Loader2, Flame, Leaf, X, Clock, Zap } from 'lucide-react'

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})

interface CartItem extends NormalizedMenuItem {
  quantity: number
}

// Define the logical meal order for categories
// Lower number = higher priority (appears first)
// Unknown categories will appear at the end in alphabetical order
const CATEGORY_ORDER: Record<string, number> = {
  appetizers: 1,
  starters: 1,
  soups: 2,
  salads: 3,
  mains: 4,
  entrees: 4,
  pizza: 5,
  pasta: 5,
  seafood: 6,
  sides: 7,
  desserts: 8,
  drinks: 9,
  beverages: 9,
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<NormalizedMenuItem | null>(
    null,
  )

  // Fetch menu items from API
  const {
    data: menuItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  })

  // Filter items by category
  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  // Get unique categories from the fetched items, sorted by meal order
  const availableCategories = [
    { id: 'all', name: 'All' },
    ...Array.from(new Set(menuItems.map((item) => item.category)))
      .sort((a, b) => {
        const orderA = CATEGORY_ORDER[a] ?? 100
        const orderB = CATEGORY_ORDER[b] ?? 100
        // If same priority, sort alphabetically
        if (orderA === orderB) return a.localeCompare(b)
        return orderA - orderB
      })
      .map((cat) => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
  ]

  const addToCart = (item: NormalizedMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const getItemQuantity = (id: string) => {
    const item = cart.find((i) => i.id === id)
    return item?.quantity || 0
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <p className="text-sm text-primary mb-2">Aperture Dining</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Menu
            </h1>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-card sticky top-20">
                <CardContent className="px-4">
                  <h3 className="font-semibold text-card-foreground mb-4">
                    Categories
                  </h3>
                  <nav className="space-y-1">
                    {availableCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          activeCategory === category.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Loading menu...
                  </span>
                </div>
              ) : error ? (
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardContent className="py-8 text-center">
                    <p className="text-destructive">
                      Failed to load menu. Please try again later.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No items found in this category.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => {
                    const quantity = getItemQuantity(item.id)
                    return (
                      <Card
                        key={item.id}
                        className="bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedItem(item)}
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
                                <h3 className="font-semibold text-card-foreground">
                                  {item.name}
                                </h3>
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
                                    onClick={() =>
                                      updateQuantity(item.id, quantity - 1)
                                    }
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-6 text-center font-medium text-card-foreground">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, quantity + 1)
                                    }
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
                                    addToCart(item)
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
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSidebar
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <Card
            className="bg-card max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedItem.image || '/placeholder.svg'}
                alt={selectedItem.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="px-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-card-foreground">
                  {selectedItem.name}
                </h2>
                <span className="text-xl font-bold text-primary">
                  ${selectedItem.price.toFixed(2)}
                </span>
              </div>

              <p className="text-muted-foreground mb-4">
                {selectedItem.description}
              </p>

              {/* Item details */}
              <div className="flex gap-8 mb-6">
                {selectedItem.tags.includes(MENU_TAGS.SPICY) && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Spicy
                  </span>
                )}
                {selectedItem.tags.includes(MENU_TAGS.VEGAN) && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Vegan
                  </span>
                )}
                {selectedItem.calories && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      {selectedItem.calories} calories
                    </span>
                  </div>
                )}
                {selectedItem.preparationTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      {selectedItem.preparationTime} min prep
                    </span>
                  </div>
                )}
              </div>

              {/* Add to cart button */}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                onClick={() => {
                  addToCart(selectedItem)
                  setSelectedItem(null)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Order
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
