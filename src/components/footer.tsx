import { Link } from "@tanstack/react-router"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-semibold">Aperture Dining</span>
            </div>
            <p className="text-sm text-secondary-foreground/80">
              Experience exceptional cuisine in an elegant atmosphere. Every dish tells a story.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact & Location</h4>
            <div className="space-y-3 text-sm text-secondary-foreground/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Culinary Street, Food City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@aperturedining.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="space-y-2 text-sm text-secondary-foreground/80">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Mon-Fri: 11am - 10pm</span>
              </div>
              <p className="pl-6">Sat-Sun: 10am - 11pm</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Link to={"/instagram" as "/"} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                Instagram
              </Link>
              <Link to={"/facebook" as "/"} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                Facebook
              </Link>
              <Link to={"/twitter" as "/"} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>&copy; 2025 Aperture Dining. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
