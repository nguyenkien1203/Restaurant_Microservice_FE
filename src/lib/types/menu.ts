// Menu item type matching the backend API response
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  calories?: number
  tags?: string[]
  preparationTime?: number
  isAvailable: string
  createdAt: string
  updatedAt: string
}

// Normalized menu item for frontend use
export interface NormalizedMenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  calories?: number
  tags: string[]
  preparationTime?: number
  isAvailable: boolean
}

// Request types for creating/updating menu items
export interface CreateMenuItemRequest {
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  isAvailable?: boolean
  preparationTime?: number
  calories?: number
  tags?: string[]
}

export interface UpdateMenuItemRequest {
  name?: string
  description?: string
  price?: number
  category?: string
  imageUrl?: string
  isAvailable?: boolean
  preparationTime?: number
  calories?: number
  tags?: string[]
}

// Form data for the menu item form (used in frontend)
export interface MenuItemFormData {
  name: string
  description: string
  price: string
  category: string
  imageUrl: string
  isAvailable: boolean
  preparationTime: string
  calories: string
  tags: string[]
}

// Tag constants
export const MENU_TAGS = {
  SPICY: 'Spicy',
  VEGAN: 'Vegan',
} as const

export type MenuTag = (typeof MENU_TAGS)[keyof typeof MENU_TAGS]
