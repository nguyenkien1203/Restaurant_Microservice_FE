export type OrderType = 'PRE_ORDER' | 'TAKEAWAY' | 'DELIVERY'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE'

// Request types
export interface CreateOrderItemRequest {
  menuItemId: string
  quantity: number
  notes?: string
}

export interface CreateMemberOrderRequest {
  orderType: OrderType
  items: CreateOrderItemRequest[]
  paymentMethod: PaymentMethod
  deliveryAddress?: string
  notes?: string
}

// Response types
export interface OrderItem {
  id: number
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
}

export interface Order {
  id: number
  userId: string
  guestEmail: string | null
  guestPhone: string | null
  guestName: string | null
  orderType: OrderType
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  deliveryAddress: string | null
  reservationId: string | null
  driverId: string | null
  notes: string | null
  estimatedReadyTime: string | null
  actualDeliveryTime: string | null
  orderItems: OrderItem[]
  createdAt?: string
  updatedAt?: string
}
