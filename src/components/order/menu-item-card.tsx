"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MenuItem } from "../../../lib/menu-data"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            ${item.price}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        <Button
          onClick={() => onAddToCart(item)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to Order
        </Button>
      </CardContent>
    </Card>
  )
}

