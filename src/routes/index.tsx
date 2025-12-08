import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/home/HeroSection.tsx'
import { WelcomeSection } from '@/components/home/WelcomeSection.tsx'
import { SignatureDishes } from '@/components/home/SignatureDishes.tsx'
import { Testimonials } from '@/components/home/Testimonials.tsx'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <HeroSection />
      <WelcomeSection />
      <SignatureDishes />
      <Testimonials />
    </main>
  )
}
