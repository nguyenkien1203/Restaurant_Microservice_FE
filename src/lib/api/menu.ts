import { API_BASE_URL } from '../config'
import { triggerSessionExpired } from '../auth-context'
import type {
  MenuItem,
  NormalizedMenuItem,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '../types/menu'

// Normalize API response to frontend format
export function normalizeMenuItem(item: MenuItem): NormalizedMenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.imageUrl,
    category: item.category.toLowerCase(),
    calories: item.calories,
    tags: item.tags ?? [],
    preparationTime: item.preparationTime,
    isAvailable: item.isAvailable === 'true',
  }
}

// Fetch all menu items (includes unavailable items)
export async function fetchMenuItems(): Promise<NormalizedMenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu/all`)

  if (!response.ok) {
    throw new Error('Failed to fetch menu items')
  }

  const data: MenuItem[] = await response.json()
  return data.map(normalizeMenuItem)
}

// Fetch menu items by category (includes unavailable items)
export async function fetchMenuItemsByCategory(
  category: string,
): Promise<NormalizedMenuItem[]> {
  // Capitalize first letter for API (e.g., "mains" -> "Mains")
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1)

  const response = await fetch(
    `${API_BASE_URL}/api/menu/all?category=${capitalizedCategory}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch menu items for category: ${category}`)
  }

  const data: MenuItem[] = await response.json()
  return data.map(normalizeMenuItem)
}

// Fetch unique categories from menu items
export async function fetchCategories(): Promise<string[]> {
  const items = await fetchMenuItems()
  const categories = [...new Set(items.map((item) => item.category))]
  return categories
}

// ============ Admin API Functions (require auth) ============

// Fetch all menu items for admin (includes unavailable items)
export async function fetchAdminMenuItems(): Promise<NormalizedMenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu`, {
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    throw new Error('Failed to fetch menu items')
  }

  const data: MenuItem[] = await response.json()
  return data.map(normalizeMenuItem)
}

// Create a new menu item
export async function createMenuItem(
  data: CreateMenuItemRequest,
): Promise<NormalizedMenuItem> {
  const response = await fetch(`${API_BASE_URL}/api/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      isAvailable: data.isAvailable ?? true,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to create menu item')
  }

  const item: MenuItem = await response.json()
  return normalizeMenuItem(item)
}

// Update an existing menu item
export async function updateMenuItem(
  id: string,
  data: UpdateMenuItemRequest,
): Promise<NormalizedMenuItem> {
  const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    if (response.status === 404) {
      throw new Error('Menu item not found')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to update menu item')
  }

  const item: MenuItem = await response.json()
  return normalizeMenuItem(item)
}

// Delete a menu item
export async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    if (response.status === 404) {
      throw new Error('Menu item not found')
    }
    throw new Error('Failed to delete menu item')
  }
}

// Toggle menu item availability
export async function toggleMenuItemAvailability(
  id: string,
  isAvailable: boolean,
): Promise<NormalizedMenuItem> {
  const response = await fetch(`${API_BASE_URL}/api/menu/${id}/toggle-availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ isAvailable }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    if (response.status === 404) {
      throw new Error('Menu item not found')
    }
    throw new Error('Failed to toggle availability')
  }

  const item: MenuItem = await response.json()
  return normalizeMenuItem(item)
}

// ============ Image Upload Functions ============

interface PresignedUrlResponse {
  uploadUrl: string
  imageUrl: string
}

/**
 * Upload a menu item image to S3
 * 1. Gets presigned URL from backend
 * 2. Uploads file to S3
 * 3. Returns the public image URL
 */
export async function uploadMenuImage(file: File): Promise<string> {
  // 1. Request presigned URL from backend
  const response = await fetch(`${API_BASE_URL}/api/menu/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      triggerSessionExpired()
      throw new Error('Session expired')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to get upload URL')
  }

  const { uploadUrl, imageUrl }: PresignedUrlResponse = await response.json()

  // 2. Upload file directly to S3 using presigned URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to S3')
  }

  // 3. Return the public URL
  return imageUrl
}
