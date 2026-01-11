import { API_ENDPOINTS } from '@/lib/config'
import { triggerSessionExpired } from '@/lib/auth-context'
import type {
  CreateMemberOrderRequest,
  CreatePreOrderRequest,
  Order,
  UpdateOrderStatusRequest,
} from '@/lib/types/order'

/**
 * Create a new order for authenticated members
 * Requires authentication (cookies are sent automatically)
 */
export async function createMemberOrder(
  orderData: CreateMemberOrderRequest
): Promise<Order> {
  const response = await fetch(API_ENDPOINTS.order.memberCreate, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create order: ${response.status}`)
  }

  return response.json()
}

/**
 * Create a pre-order linked to a reservation
 * Requires authentication (cookies are sent automatically)
 */
export async function createPreOrder(
  reservationId: string | number,
  orderData: CreatePreOrderRequest
): Promise<Order> {
  const response = await fetch(API_ENDPOINTS.order.preOrder(reservationId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create pre-order: ${response.status}`)
  }

  return response.json()
}

/**
 * Get the current user's orders
 */
export async function getMyOrders(): Promise<Order[]> {
  const response = await fetch(API_ENDPOINTS.order.myOrders, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`)
  }

  return response.json()
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const response = await fetch(API_ENDPOINTS.order.byId(orderId), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch order: ${response.status}`)
  }

  return response.json()
}

/**
 * Get all orders for admin
 */
export async function getAdminOrders(): Promise<Order[]> {
  const response = await fetch(API_ENDPOINTS.order.admin, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`)
  }

  return response.json()
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string | number,
  statusData: UpdateOrderStatusRequest
): Promise<Order> {
  const response = await fetch(API_ENDPOINTS.order.updateStatus(orderId.toString()), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(statusData),
  })

  if (!response.ok) {
    if (response.status === 401) {
      // triggerSessionExpired()
      // throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Failed to update order status: ${response.status}`
    )
  }

  return response.json()
}