"use client"

import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-foreground">Aperture Dining</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to={"/menu" as "/"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to={"/reservation" as "/"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Reservations
            </Link>
            <Link to={"/order" as "/"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Order Online
            </Link>
            <Link to={"/about" as "/"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to={"/login" as "/"}>
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to={"/signup" as "/"}>
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </Link>
            <Link to={"/reservation" as "/"}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Book a Table
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-sm text-foreground">
                Home
              </Link>
              <Link to={"/menu" as "/"} className="text-sm text-muted-foreground">
                Menu
              </Link>
              <Link to={"/reservation" as "/"} className="text-sm text-muted-foreground">
                Reservations
              </Link>
              <Link to={"/order" as "/"} className="text-sm text-muted-foreground">
                Order Online
              </Link>
              <Link to={"/about" as "/"} className="text-sm text-muted-foreground">
                About
              </Link>
              <div className="flex gap-2 pt-2">
                <Link to={"/login" as "/"}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to={"/signup" as "/"}>
                  <Button variant="outline" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link to={"/reservation" as "/"}>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Book a Table
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
