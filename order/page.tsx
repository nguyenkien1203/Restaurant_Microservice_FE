"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryTabs } from "@/components/order/category-tabs"
import { MenuItemCard } from "@/components/order/menu-item-card"
import { CartSidebar } from "@/components/order/cart-sidebar"
import { menuItems, type MenuItem } from "@/lib/menu-data"

interface CartItem extends MenuItem {
  quantity: number
}

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])

  const filteredItems =
    activeCategory === "all" ? menuItems : menuItems.filter((item) => item.category === activeCategory)

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted">
        <div className="bg-secondary py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Craft Your Perfect Meal
            </h1>
            <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
              Browse our menu and build your order. Available for takeaway and delivery.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <CartSidebar items={cart} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
