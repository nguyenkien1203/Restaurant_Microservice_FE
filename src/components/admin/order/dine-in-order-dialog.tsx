import { useState } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Minus, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminMenuItems } from '@/lib/api/menu'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import type { CreateDineInOrderRequest } from '@/lib/types/order'

interface OrderItem {
  menuItemId: string
  quantity: number
  menuItem: NormalizedMenuItem
}

interface DineInOrderDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDineInOrderRequest) => Promise<void>
  isLoading?: boolean
}

export function DineInOrderDialog({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: DineInOrderDialogProps) {
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['adminMenuItems'],
    queryFn: fetchAdminMenuItems,
    enabled: open,
  })

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category)),
  ).sort()

  const filteredMenuItems = menuItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory,
  )

  const addMenuItem = (item: NormalizedMenuItem) => {
    const existing = orderItems.find((oi) => oi.menuItemId === item.id)
    if (existing) {
      setOrderItems(
        orderItems.map((oi) =>
          oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi,
        ),
      )
    } else {
      setOrderItems([
        ...orderItems,
        { menuItemId: item.id, quantity: 1, menuItem: item },
      ])
    }
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter((oi) => oi.menuItemId !== menuItemId))
    } else {
      setOrderItems(
        orderItems.map((oi) =>
          oi.menuItemId === menuItemId ? { ...oi, quantity } : oi,
        ),
      )
    }
  }

  const removeItem = (menuItemId: string) => {
    setOrderItems(orderItems.filter((oi) => oi.menuItemId !== menuItemId))
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  )
  const tax = subtotal * 0.08
  const totalAmount = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      return
    }

    const orderData: CreateDineInOrderRequest = {
      items: orderItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
      notes: notes.trim() || undefined,
    }

    await onSubmit(orderData)
  }

  const handleClose = () => {
    setNotes('')
    setOrderItems([])
    setSelectedCategory('all')
    onClose()
  }

  const isValid = orderItems.length > 0

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-4xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Create Dine-In Order</DialogTitle>
        </DialogHeader>

        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Menu Items Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Menu Items</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className={selectedCategory === 'all' ? 'bg-accent' : ''}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 'bg-accent' : ''}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoadingMenu ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                  {filteredMenuItems.map((item) => {
                    const orderItem = orderItems.find(
                      (oi) => oi.menuItemId === item.id,
                    )
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-accent/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        {orderItem ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.id, orderItem.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {orderItem.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.id, orderItem.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addMenuItem(item)}
                            disabled={!item.isAvailable}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected Items Summary */}
            <div className="space-y-2">
              <Label className="py-2">Selected Items</Label>
              {orderItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 rounded border border-dashed border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    No items selected yet. Choose dishes from the menu on the left to
                    start building this dine-in order.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.quantity}x {item.menuItem.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item.menuItemId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="text-foreground">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary text-lg">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
            
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions..."
              rows={1}
            />
          </div>
          
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Order
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
