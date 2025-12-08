export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: "1",
    name: "Bruschetta",
    description: "Toasted bread with tomatoes, garlic & basil",
    price: 12,
    image: "/placeholder.svg?key=xatvb",
    category: "appetizers",
  },
  {
    id: "2",
    name: "Shrimp Cocktail",
    description: "Chilled jumbo shrimp with cocktail sauce",
    price: 18,
    image: "/placeholder.svg?key=5gfbo",
    category: "appetizers",
  },
  {
    id: "3",
    name: "Crispy Calamari",
    description: "Lightly fried calamari with marinara",
    price: 16,
    image: "/placeholder.svg?key=3skma",
    category: "appetizers",
  },
  {
    id: "4",
    name: "Soup of the Day",
    description: "Chef's daily creation",
    price: 10,
    image: "/placeholder.svg?key=9f00f",
    category: "appetizers",
  },
  // Mains
  {
    id: "5",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon herb butter",
    price: 32,
    image: "/placeholder.svg?key=7vfv9",
    category: "mains",
  },
  {
    id: "6",
    name: "Filet Mignon",
    description: "8oz prime beef with red wine reduction",
    price: 45,
    image: "/placeholder.svg?key=fxpsr",
    category: "mains",
  },
  {
    id: "7",
    name: "Truffle Pasta",
    description: "Fresh pasta with black truffle cream",
    price: 28,
    image: "/placeholder.svg?key=8xbli",
    category: "mains",
  },
  {
    id: "8",
    name: "Chicken Marsala",
    description: "Pan-seared chicken with mushroom wine sauce",
    price: 26,
    image: "/placeholder.svg?key=wgb1a",
    category: "mains",
  },
  // Pizza
  {
    id: "9",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato, basil",
    price: 18,
    image: "/placeholder.svg?key=rz1lf",
    category: "pizza",
  },
  {
    id: "10",
    name: "Spaghetti Bolognese",
    description: "Classic meat sauce over spaghetti",
    price: 22,
    image: "/placeholder.svg?key=oo3jm",
    category: "pasta",
  },
  // Desserts
  {
    id: "11",
    name: "Tiramisu",
    description: "Classic Italian coffee dessert",
    price: 12,
    image: "/placeholder.svg?key=7n3n7",
    category: "desserts",
  },
  {
    id: "12",
    name: "Chocolate Lava Cake",
    description: "Warm cake with molten center",
    price: 14,
    image: "/placeholder.svg?key=v06s9",
    category: "desserts",
  },
  // Drinks
  {
    id: "13",
    name: "Fresh Lemonade",
    description: "House-made with fresh lemons",
    price: 6,
    image: "/placeholder.svg?key=9t5e9",
    category: "drinks",
  },
  {
    id: "14",
    name: "Italian Soda",
    description: "Sparkling water with flavor syrup",
    price: 5,
    image: "/placeholder.svg?key=u1a3l",
    category: "drinks",
  },
]

export const categories = [
  { id: "all", name: "All Items", icon: "🍽️" },
  { id: "appetizers", name: "Appetizers", icon: "🥗" },
  { id: "mains", name: "Main Course", icon: "🍖" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
]
