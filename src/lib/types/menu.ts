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