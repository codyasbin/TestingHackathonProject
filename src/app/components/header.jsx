"use client"

import Link from "next/link"
import { useState } from "react"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">ServiceHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/services" className="text-foreground hover:text-primary transition">
              Services
            </Link>
            <Link href="/dashboard" className="text-foreground hover:text-primary transition">
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary transition">Sign In</button>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition">
              Sign Up
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link href="/" className="block py-2 text-foreground hover:text-primary">
              Home
            </Link>
            <Link href="/services" className="block py-2 text-foreground hover:text-primary">
              Services
            </Link>
            <Link href="/dashboard" className="block py-2 text-foreground hover:text-primary">
              My Bookings
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
