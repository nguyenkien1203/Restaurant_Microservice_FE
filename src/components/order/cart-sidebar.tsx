'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Minus,
  Plus,
  Trash2,
  Handbag,
  ShoppingBag,
  Package2,
  Edit2,
  X,
  CalendarCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { NormalizedMenuItem } from '@/lib/types/menu'

export type OrderType = 'PRE_ORDER' | 'TAKEAWAY' | 'DELIVERY'

const CART_STORAGE_KEY = 'aperture_dining_cart'
const ORDER_TYPE_STORAGE_KEY = 'aperture_dining_order_type'

export interface CartItem extends NormalizedMenuItem {
  quantity: number
  notes?: string
}

export function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save cart to storage:', error)
  }
}

export function getCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to get cart from storage:', error)
    localStorage.removeItem(CART_STORAGE_KEY)
  }
  return []
}

export function saveOrderTypeToStorage(orderType: OrderType): void {
  try {
    localStorage.setItem(ORDER_TYPE_STORAGE_KEY, orderType)
  } catch (error) {
    console.error('Failed to save order type to storage:', error)
  }
}

export function getOrderTypeFromStorage(): OrderType | null {
  try {
    const stored = localStorage.getItem(ORDER_TYPE_STORAGE_KEY)
    if (stored && ['PRE_ORDER', 'TAKEAWAY', 'DELIVERY'].includes(stored)) {
      return stored as OrderType
    }
  } catch (error) {
    console.error('Failed to get order type from storage:', error)
    localStorage.removeItem(ORDER_TYPE_STORAGE_KEY)
  }
  return null
}

export function clearCartStorage(): void {
  localStorage.removeItem(CART_STORAGE_KEY)
  localStorage.removeItem(ORDER_TYPE_STORAGE_KEY)
}

const orderTypeOptions: {
  value: OrderType
  label: string
  icon: React.ReactNode
  requiresReservation?: boolean
}[] = [
    {
      value: 'PRE_ORDER',
      label: 'Pre-order',
      icon: <CalendarCheck className="h-4 w-4" />,
      requiresReservation: true,
    },
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

interface CartSidebarProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onUpdateNotes?: (id: string, notes: string) => void
  reservationId?: string
}

export function CartSidebar({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  reservationId,
}: CartSidebarProps) {
  const navigate = useNavigate()
  const [orderType, setOrderType] = useState<OrderType>(() => {
    // Default to PRE_ORDER if reservationId is present
    if (reservationId) return 'PRE_ORDER'
    return getOrderTypeFromStorage() || 'TAKEAWAY'
  })
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  // Filter order type options based on whether we have a reservationId
  const availableOrderTypes = useMemo(() => {
    return orderTypeOptions.filter(option => {
      if (option.requiresReservation) {
        return !!reservationId
      }
      return true
    })
  }, [reservationId])

  // Save cart and orderType to localStorage whenever they change
  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  useEffect(() => {
    saveOrderTypeToStorage(orderType)
  }, [orderType])

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const tax = subtotal * 0.08
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
            {availableOrderTypes.map((option) => (
              <button
                key={option.value}
                onClick={() => setOrderType(option.value)}
                className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-sm transition-colors ${orderType === option.value
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
                {items.map((item) => {
                  const isEditingNotes = editingNotesId === item.id

                  const handleStartEditNotes = () => {
                    setEditingNotesId(item.id)
                    setNotesValue(item.notes || '')
                  }

                  const handleSaveNotes = () => {
                    if (onUpdateNotes) {
                      onUpdateNotes(item.id, notesValue.trim())
                    }
                    setEditingNotesId(null)
                    setNotesValue('')
                  }

                  const handleCancelEditNotes = () => {
                    setEditingNotesId(null)
                    setNotesValue('')
                  }

                  return (
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

                      {/* Notes section */}
                      {isEditingNotes ? (
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Add a note (e.g., No onions)"
                            className="text-sm h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNotes()
                              } else if (e.key === 'Escape') {
                                handleCancelEditNotes()
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveNotes}
                            className="h-8 px-2 rounded border border-border hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={handleCancelEditNotes}
                            className="h-8 px-2 rounded border border-border hover:bg-accent transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          {item.notes ? (
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground italic">
                                Note: {item.notes}
                              </span>
                              {onUpdateNotes && (
                                <button
                                  onClick={handleStartEditNotes}
                                  className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            onUpdateNotes && (
                              <button
                                onClick={handleStartEditNotes}
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                              >
                                <Edit2 className="h-3 w-3" />
                                Add note
                              </button>
                            )
                          )}
                        </div>
                      )}

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
                  )
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-card-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
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
                  // Save cart and orderType before navigating
                  saveCartToStorage(items)
                  saveOrderTypeToStorage(orderType)

                  if (orderType === 'DELIVERY' || orderType === 'TAKEAWAY' || orderType === 'PRE_ORDER') {
                    navigate({
                      to: '/checkout',
                      search: reservationId ? { reservationId } : undefined,
                    })
                  } else {
                    navigate({
                      to: '/order-confirmation',
                      search: { orderId: `ORD-${Date.now()}` },
                    })
                  }
                }}
                disabled={items.length === 0}
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
