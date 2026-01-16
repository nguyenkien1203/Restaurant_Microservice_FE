export type OrderType = 'PRE_ORDER' | 'TAKEAWAY' | 'DELIVERY' | 'DINE_IN'

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
  estimatedPickupTime?: string
  notes?: string
  reservationId?: number
}

export interface CreatePreOrderRequest {
  items: CreateOrderItemRequest[]
  paymentMethod: PaymentMethod
  notes?: string
}

export interface CreateGuestOrderRequest {
  orderType: OrderType
  items: CreateOrderItemRequest[]
  paymentMethod: PaymentMethod
  guestEmail: string
  guestPhone: string
  guestName: string
  deliveryAddress?: string
  estimatedPickupTime?: string
  notes?: string
}

export interface CreateDineInOrderRequest {
  tableId: number
  items: CreateOrderItemRequest[]
  notes?: string
  reservationId?: number
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus
  reason?: string
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
  estimatedPickupTime: string | null
  actualDeliveryTime: string | null
  orderItems: OrderItem[]
  createdAt?: string
  updatedAt?: string
}
