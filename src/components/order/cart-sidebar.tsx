'use client'

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Minus,
  Plus,
  Trash2,
  Handbag,
  ShoppingBag,
  Package2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { NormalizedMenuItem } from '@/lib/types/menu'

export type OrderType = 'PRE_ORDER' | 'TAKEAWAY' | 'DELIVERY'

const orderTypeOptions: {
  value: OrderType
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: 'TAKEAWAY',
    label: 'Takeaway',
    icon: <Handbag className="h-4 w-4" />,
  },
  {
    value: 'DELIVERY',
    label: 'Delivery',
    icon: <Package2 className="h-4 w-4" />,
  },
]

interface CartItem extends NormalizedMenuItem {
  quantity: number
}

interface CartSidebarProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export function CartSidebar({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartSidebarProps) {
  const navigate = useNavigate()
  const [orderType, setOrderType] = useState<OrderType>('TAKEAWAY')

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="sticky top-20 space-y-3">
      {/* Order Type Selection */}
      <Card>
        <CardContent>
          <p className="text-sm font-medium text-card-foreground mb-3">
            How would you like your order?
          </p>
          <div className="flex flex-col gap-2">
            {orderTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setOrderType(option.value)}
                className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-sm transition-colors ${
                  orderType === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Your Order</h3>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Start adding items
            </p>
          ) : (
            <>
              <div className="divide-y divide-border/50 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    {/* Line 1: Item name and price */}
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-card-foreground font-medium">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {/* Line 2: Quantity controls and trash */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-medium text-card-foreground text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-card-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="text-card-foreground">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span className="text-card-foreground">Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (orderType === 'DELIVERY' || orderType === 'TAKEAWAY') {
                    navigate({ to: '/checkout' })
                  } else {
                    navigate({
                      to: '/order-confirmation',
                      search: { orderId: `ORD-${Date.now()}` },
                    })
                  }
                }}
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
