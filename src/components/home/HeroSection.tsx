import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button.tsx'

export function HeroSection() {
  return (
    <section className="relative bg-secondary min-h-[500px] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
          alt="Aperture Dining Restaurant"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground mb-6 text-balance">
            Aperture Dining
          </h1>
          <p className="text-lg text-secondary-foreground/90 mb-8 max-w-lg">
            Experience exceptional cuisine crafted with passion. Every dish
            tells a story of tradition, innovation, and the finest ingredients.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={'/menu' as '/'}>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Explore Menu
              </Button>
            </Link>
            <Link to={'/reservations' as '/'}>
              <Button
                size="lg"
                variant="outline"
                className="border-secondary-foreground/70 text-secondary-foreground bg-secondary-foreground/5 hover:bg-secondary-foreground hover:text-secondary hover:border-secondary-foreground"
              >
                Book a Table
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
