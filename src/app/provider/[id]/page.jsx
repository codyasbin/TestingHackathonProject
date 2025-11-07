"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import BookingModal from "@/app/components/booking-modal"
import { useParams } from "next/navigation"

const allProviders = [
  {
    id: 1,
    name: "John Plumbing Solutions",
    category: "plumbing",
    rating: 4.8,
    reviews: 234,
    distance: 0.5,
    price: 50,
    bio: "Expert plumber with 10 years experience",
    description:
      "I provide comprehensive plumbing solutions for residential and commercial properties. Specializing in repairs, installations, and emergency services.",
    sustainability: "Uses eco-friendly materials and water-saving fixtures",
    languages: "English, Spanish",
    responseTime: "30 mins",
    verified: true,
    image: "/professional-plumber.png",
    reviews_list: [
      { id: 1, author: "Sarah", rating: 5, text: "Excellent work! Fixed my leak quickly." },
      { id: 2, author: "Mike", rating: 5, text: "Professional and friendly. Highly recommend!" },
      { id: 3, author: "Emma", rating: 4, text: "Good service, a bit pricey but worth it." },
    ],
  },
  // Add other providers similarly...
  {
    id: 2,
    name: "Electric Innovations",
    category: "electrical",
    rating: 4.9,
    reviews: 189,
    distance: 1.2,
    price: 60,
    bio: "Licensed electrician, certified in green energy",
    description: "Professional electrical services including installations, repairs, and solar solutions.",
    sustainability: "Specializes in solar installation and energy efficiency",
    languages: "English",
    responseTime: "45 mins",
    verified: true,
    image: "/electrician-professional.png",
    reviews_list: [{ id: 1, author: "John", rating: 5, text: "Very knowledgeable about solar!" }],
  },
]

export default function ProviderDetail() {
    const params = useParams()
  const provider = allProviders.find((p) => p.id === Number.parseInt(params.id))
  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState(null)

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Provider not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <Link href="/services" className="text-primary hover:underline text-sm mb-6 inline-block">
            ← Back
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Provider Info */}
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex gap-6 mb-6">
                  <img
                    src={provider.image || "/placeholder.svg"}
                    alt={provider.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                      {provider.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-primary capitalize font-medium mb-2">{provider.category}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        ⭐ {provider.rating} ({provider.reviews} reviews)
                      </span>
                      <span>📍 {provider.distance} km away</span>
                      <span>⏱ {provider.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground">{provider.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">🌱 Sustainability Commitment</h3>
                    <p className="text-muted-foreground">{provider.sustainability}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Languages</p>
                      <p className="font-medium text-foreground">{provider.languages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium text-primary text-lg">${provider.price}/hr</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                  {provider.reviews_list &&
                    provider.reviews_list.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{review.author}</span>
                          <span className="text-yellow-400">{"★".repeat(review.rating)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.text}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="md:col-span-1">
              <div className="bg-primary text-primary-foreground rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold mb-4">Book This Service</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold">${provider.price}</span>
                  </div>
                  <div className="text-sm opacity-80">
                    <p>Average service duration: 2-3 hours</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-primary-foreground text-primary py-3 rounded-lg font-semibold hover:opacity-90 transition mb-3"
                >
                  Request Booking
                </button>

                <button className="w-full border-2 border-primary-foreground py-2 rounded-lg text-primary-foreground hover:bg-primary-foreground/10 transition">
                  Message Provider
                </button>

                <div className="mt-6 pt-6 border-t border-primary-foreground/20 text-xs opacity-80">
                  <p>✓ Verified provider</p>
                  <p>✓ Secured payments</p>
                  <p>✓ Money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showBooking && (
        <BookingModal
          provider={provider}
          onClose={() => setShowBooking(false)}
          onBook={(data) => {
            setBookingData(data)
            setShowBooking(false)
          }}
        />
      )}

      <Footer />
    </div>
  )
}
