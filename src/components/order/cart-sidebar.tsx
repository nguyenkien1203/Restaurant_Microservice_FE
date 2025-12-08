"use client"

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MenuItem } from "../../../lib/menu-data"

interface CartItem extends MenuItem {
  quantity: number
}

interface CartSidebarProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export function CartSidebar({ items, onUpdateQuantity, onRemoveItem }: CartSidebarProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="h-5 w-5" />
          Your Order
          {items.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Add items from the menu to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-2 bg-muted/50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                    <p className="text-sm text-primary font-semibold">${item.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto h-6 w-6 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Proceed to Checkout
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

