import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { NormalizedMenuItem } from "@/lib/types/menu"
import { fetchMenuItems } from "@/lib/api/menu"
import { Card, CardContent } from "@/components/ui/card.tsx"

export function SignatureDishes() {
  const {
    data: menuItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menuItems"],
    queryFn: fetchMenuItems,
  })

  const featuredItems = useMemo<NormalizedMenuItem[]>(() => {
    return menuItems.slice(0, 4)
  }, [menuItems])

  const showFallback = !isLoading && (error || featuredItems.length === 0)

  const renderCard = (item: NormalizedMenuItem, idx: number) => (
    <Link
      key={item.id}
      to={"/menu" as "/"}
      search={(prev) => ({ ...prev, itemId: item.id })}
      className="h-full"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow bg-card py-0">
        <div className="aspect-4/3 overflow-hidden">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading={idx < 2 ? "eager" : "lazy"}
          />
        </div>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-card-foreground">{item.name}</h3>
            <span className="text-primary font-semibold">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    </Link>
  )

  const renderSkeleton = (idx: number) => (
    <Card
      key={`skeleton-${idx}`}
      className="overflow-hidden bg-card animate-pulse h-full"
    >
      <div className="aspect-4/3 bg-muted" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </CardContent>
    </Card>
  )

  const renderFallbackCard = (idx: number) => (
    <Card key={`fallback-${idx}`} className="overflow-hidden bg-card h-full">
      <div className="aspect-4/3 bg-muted" />
      <CardContent className="p-4 space-y-2">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </CardContent>
    </Card>
  )

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-(family-name:--font-playfair) text-3xl md:text-4xl font-bold text-foreground mb-4">
            Taste Our Signature Dishes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our chef's carefully curated selection of dishes that showcase the best of contemporary cuisine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading &&
            Array.from({ length: 4 }).map((_, idx) => renderSkeleton(idx))}

          {!isLoading &&
            !showFallback &&
            featuredItems.map((item, idx) => renderCard(item, idx))}

          {showFallback &&
            Array.from({ length: 4 }).map((_, idx) => renderFallbackCard(idx))}
        </div>
      </div>
    </section>
  )
}
