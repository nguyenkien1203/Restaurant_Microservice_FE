export function WelcomeSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-foreground mb-6">
              Welcome to Aperture Dining
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              At Aperture Dining, we believe that exceptional food deserves an exceptional experience. Our culinary team
              crafts each dish with precision, passion, and the finest locally-sourced ingredients.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're celebrating a special occasion or enjoying a casual dinner, our warm ambiance and attentive
              service create memories that last a lifetime.
            </p>
          </div>
          <div className="relative">
            <img
              src="/gourmet-pasta-dish-with-herbs-and-parmesan-cheese-.jpg"
              alt="Signature Pasta Dish"
              className="rounded-lg shadow-xl w-full h-[350px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

