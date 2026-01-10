// Menu item type matching the backend API response
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  calories?: number
  isSpicy?: boolean
  isVegan?: boolean
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
  isSpicy?: boolean
  isVegan?: boolean
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
  isSpicy?: boolean
  isVegan?: boolean
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
  isSpicy?: boolean
  isVegan?: boolean
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
  isSpicy: boolean
  isVegan: boolean
}