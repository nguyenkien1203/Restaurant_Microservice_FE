import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { menuItems, type MenuItem } from "../../lib/menu-data"
import { cn } from "../lib/utils"
import { Plus, Minus, ShoppingBag } from "lucide-react"

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})

interface CartItem extends MenuItem {
    quantity: number
  }
  
  const categories = [
    { id: "appetizers", name: "Appetizers" },
    { id: "mains", name: "Mains" },
    { id: "pizza", name: "Pizza" },
    { id: "pasta", name: "Pasta" },
    { id: "desserts", name: "Desserts" },
    { id: "drinks", name: "Drinks" },
  ]
  
  export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("appetizers")
    const [cart, setCart] = useState<CartItem[]>([])
  
    const filteredItems = menuItems.filter((item) => item.category === activeCategory)
  
    const addToCart = (item: MenuItem) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id)
        if (existing) {
          return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        }
        return [...prev, { ...item, quantity: 1 }]
      })
    }
  
    const updateQuantity = (id: string, delta: number) => {
      setCart((prev) => {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i)).filter((i) => i.quantity > 0)
      })
    }
  
    const getItemQuantity = (id: string) => {
      const item = cart.find((i) => i.id === id)
      return item?.quantity || 0
    }
  
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax
  
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <p className="text-sm text-primary mb-2">Restaurants</p>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Menu
              </h1>
            </div>
  
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-card sticky top-20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-card-foreground mb-4">Categories</h3>
                    <nav className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            activeCategory === category.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
                <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">
                  {categories.find((c) => c.id === activeCategory)?.name}
                </h2>
                <div className="space-y-4">
                  {filteredItems.map((item) => {
                    const quantity = getItemQuantity(item.id)
                    return (
                      <Card key={item.id} className="bg-card overflow-hidden">
                        <div className="flex">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-32 h-32 object-cover"
                          />
                          <CardContent className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                                <span className="font-semibold text-primary">${item.price}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                            <div className="flex justify-end mt-2">
                              {quantity > 0 ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-6 text-center font-medium text-card-foreground">{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
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
              </div>
  
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-card sticky top-20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-card-foreground">Your Order</h3>
                    </div>
  
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Start adding items</p>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-card-foreground">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
  
                        <div className="border-t border-border pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-card-foreground">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="text-card-foreground">${tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t border-border">
                            <span className="text-card-foreground">Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                          </div>
                        </div>
  
                        <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                          Place Order
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
