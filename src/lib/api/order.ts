import { API_ENDPOINTS } from '@/lib/config'
import { triggerSessionExpired } from '@/lib/auth-context'
import type { CreateMemberOrderRequest, Order } from '@/lib/types/order'

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
