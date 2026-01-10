import { API_BASE_URL } from '../config'
import type { MenuItem, NormalizedMenuItem } from '../types/menu'

// Normalize API response to frontend format
export function normalizeMenuItem(item: MenuItem): NormalizedMenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.imageUrl,
    category: item.category.toLowerCase(), // Normalize category to lowercase
    calories: item.calories,
    isSpicy: item.isSpicy,
    isVegan: item.isVegan,
    preparationTime: item.preparationTime,
    isAvailable: item.isAvailable === 'true',
  }
}

// Fetch all menu items
export async function fetchMenuItems(): Promise<NormalizedMenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu/all`)

  if (!response.ok) {
    throw new Error('Failed to fetch menu items')
  }

  const data: MenuItem[] = await response.json()
  return data.filter((item) => item.isAvailable === 'true').map(normalizeMenuItem)
}

// Fetch menu items by category
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
  return data.filter((item) => item.isAvailable === 'true').map(normalizeMenuItem)
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
    credentials: 'include', // Include auth cookies
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in as admin')
    }
    throw new Error('Failed to fetch menu items')
  }

  const data: MenuItem[] = await response.json()
  // Return all items for admin (don't filter by availability)
  return data.map(normalizeMenuItem)
}
