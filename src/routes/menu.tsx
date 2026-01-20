import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CartSidebar,
  type CartItem,
  getCartFromStorage,
} from '@/components/order/cart-sidebar'
import { fetchMenuItems } from '@/lib/api/menu'
import { getPublicReservation } from '@/lib/api/reservation'
import { formatTime24to12 } from '@/lib/api/reservation'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import {
  MenuHeader,
  CategorySidebar,
  MenuItemList,
  MenuItemDetailModal,
  getSortedCategories,
} from '@/components/menu'

interface MenuSearchParams {
  reservationId?: string
  itemId?: string
}

export const Route = createFileRoute('/menu')({
  component: MenuPage,
  validateSearch: (search: Record<string, unknown>): MenuSearchParams => {
    return {
      reservationId: search.reservationId as string | undefined,
      itemId: search.itemId as string | undefined,
    }
  },
})

export default function MenuPage() {
  const search = useSearch({ from: '/menu' })
  const reservationId = search.reservationId

  const [activeCategory, setActiveCategory] = useState('appetizers')
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => {
    return getCartFromStorage()
  })
  const [selectedItem, setSelectedItem] = useState<NormalizedMenuItem | null>(
    null,
  )

  // Fetch reservation details if reservationId is present
  const { data: reservation } = useQuery({
    queryKey: ['publicReservation', reservationId],
    queryFn: () => getPublicReservation(reservationId!),
    enabled: !!reservationId,
  })

  // Derive guest info from reservation data
  const guestInfo = useMemo(() => {
    if (!reservation) return {}

    // Parse guest name into firstName and lastName
    const nameParts = reservation.guestName?.split(' ') || []
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return {
      firstName,
      lastName,
      email: reservation.guestEmail || undefined,
      phone: reservation.guestPhone || undefined,
      reservationDate: reservation.reservationDate,
      reservationTime: formatTime24to12(reservation.startTime),
    }
  }, [reservation])

  const {
    data: menuItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  })

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.category === activeCategory)
  }, [menuItems, activeCategory])

  const availableCategories = useMemo(
    () => getSortedCategories(menuItems),
    [menuItems],
  )

  useEffect(() => {
    if (availableCategories.length === 0) return

    const hasActive = availableCategories.some((c) => c.id === activeCategory)
    if (!hasActive) {
      // Default to appetizers if present, otherwise fall back to first available category
      const appetizers = availableCategories.find((c) => c.id === 'appetizers')
      setActiveCategory(appetizers?.id ?? availableCategories[0].id)
    }
  }, [availableCategories, activeCategory])

  useEffect(() => {
    if (!search.itemId || menuItems.length === 0) return

    const target = menuItems.find((item) => item.id === search.itemId)
    if (!target) return

    setActiveCategory(target.category)
    setHighlightItemId(target.id)
  }, [search.itemId, menuItems])

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
                onRetry={() => refetch()}
                highlightItemId={highlightItemId}
                onHighlightComplete={() => setHighlightItemId(null)}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSidebar
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onUpdateNotes={updateNotes}
                reservationId={reservationId}
                firstName={guestInfo.firstName}
                lastName={guestInfo.lastName}
                email={guestInfo.email}
                phone={guestInfo.phone}
                reservationDate={guestInfo.reservationDate}
                reservationTime={guestInfo.reservationTime}
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
