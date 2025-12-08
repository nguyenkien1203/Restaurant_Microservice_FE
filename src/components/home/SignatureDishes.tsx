import { Card, CardContent } from "@/components/ui/card.tsx"

const dishes = [
  {
    name: "Signature Pasta",
    description: "Hand-made pasta with truffle cream sauce",
    image: "/gourmet-pasta-dish-with-truffle-cream-sauce.jpg",
    price: "$24",
  },
  {
    name: "Grilled Tenderloin",
    description: "Premium beef with seasonal vegetables",
    image: "/grilled-beef-tenderloin-with-vegetables-fine-dinin.jpg",
    price: "$38",
  },
  {
    name: "Ocean Fresh",
    description: "Pan-seared salmon with citrus glaze",
    image: "/pan-seared-salmon-with-citrus-glaze-on-plate.jpg",
    price: "$32",
  },
  {
    name: "Gourmet Starter",
    description: "Artisan bruschetta with fresh toppings",
    image: "/gourmet-bruschetta-appetizer-with-tomatoes-and-bas.jpg",
    price: "$16",
  },
]

export function SignatureDishes() {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-foreground mb-4">
            Taste Our Signature Dishes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our chef's carefully curated selection of dishes that showcase the best of contemporary cuisine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <Card key={dish.name} className="overflow-hidden hover:shadow-lg transition-shadow bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={dish.image || "/placeholder.svg"}
                  alt={dish.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-card-foreground">{dish.name}</h3>
                  <span className="text-primary font-semibold">{dish.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{dish.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

