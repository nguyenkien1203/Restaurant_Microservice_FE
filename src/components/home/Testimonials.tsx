import { Card, CardContent } from "@/components/ui/card.tsx"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Mitchell",
    text: "The best dining experience I've had in years. The attention to detail and flavor combinations were extraordinary.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    text: "From the moment we walked in, the service was impeccable. The truffle pasta is absolutely divine!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    text: "Perfect for special occasions. The ambiance, food, and wine selection exceeded all expectations.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Guests Are Saying
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-card-foreground">— {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

