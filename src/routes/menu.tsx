import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CartSidebar,
  type CartItem,
  getCartFromStorage,
} from '@/components/order/cart-sidebar'
import { fetchMenuItems } from '@/lib/api/menu'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import {
  MenuHeader,
  CategorySidebar,
  MenuItemList,
  MenuItemDetailModal,
  getSortedCategories,
} from '@/components/menu'

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>(() => {
    return getCartFromStorage()
  })
  const [selectedItem, setSelectedItem] = useState<NormalizedMenuItem | null>(
    null,
  )

  const {
    data: menuItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  })

  const filteredItems = useMemo(() => {
    return activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)
  }, [menuItems, activeCategory])

  const availableCategories = useMemo(
    () => getSortedCategories(menuItems),
    [menuItems],
  )

  const addToCart = (item: NormalizedMenuItem, notes?: string) => {
    // Prevent adding unavailable items
    if (!item.isAvailable) {
      return
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { ...item, quantity: 1, notes: notes || undefined }]
    })
  }

  const updateNotes = (id: string, notes: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, notes: notes || undefined } : i)),
    )
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
          <MenuHeader />

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <CategorySidebar
                categories={availableCategories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              <MenuItemList
                items={filteredItems}
                isLoading={isLoading}
                error={error}
                getItemQuantity={getItemQuantity}
                onItemSelect={setSelectedItem}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSidebar
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onUpdateNotes={updateNotes}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <MenuItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
}
