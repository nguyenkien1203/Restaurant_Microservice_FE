import { useState } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [tableId, setTableId] = useState('')
  const [reservationId, setReservationId] = useState('')
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

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tableId || orderItems.length === 0) {
      return
    }

    const orderData: CreateDineInOrderRequest = {
      tableId: parseInt(tableId, 10),
      items: orderItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
      notes: notes.trim() || undefined,
      reservationId: reservationId ? parseInt(reservationId, 10) : undefined,
    }

    await onSubmit(orderData)
  }

  const handleClose = () => {
    setTableId('')
    setReservationId('')
    setNotes('')
    setOrderItems([])
    setSelectedCategory('all')
    onClose()
  }

  const isValid = tableId && orderItems.length > 0

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-4xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Create Dine-In Order</DialogTitle>
        </DialogHeader>

        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Table and Reservation Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tableId">
                Table ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tableId"
                type="number"
                min="1"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Enter table number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservationId">Reservation ID (Optional)</Label>
              <Input
                id="reservationId"
                type="number"
                min="1"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Enter reservation ID"
              />
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
              <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-2">
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
          {orderItems.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label>Selected Items</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary text-lg">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
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
