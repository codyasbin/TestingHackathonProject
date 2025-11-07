"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, MapPin, Clock, Star, MoreVertical, Edit, Trash2, Phone, Leaf, ArrowRight } from "lucide-react"

// Mock booking history
const mockBookings = [
  {
    id: "BC-ABC123XYZ",
    provider: "Green Thumb Landscaping",
    service: "Organic Garden Setup",
    date: "2025-01-15",
    time: "10:00 AM",
    location: "San Francisco, CA",
    price: "$800",
    status: "confirmed",
    rating: null,
  },
  {
    id: "BC-DEF456UVW",
    provider: "Sunny Solutions",
    service: "Solar Panel Installation Consultation",
    date: "2024-12-20",
    time: "2:00 PM",
    location: "San Francisco, CA",
    price: "$150",
    status: "completed",
    rating: 5,
  },
  {
    id: "BC-GHI789RST",
    provider: "Waste Wise Co.",
    service: "Composting Setup",
    date: "2024-11-10",
    time: "11:00 AM",
    location: "Oakland, CA",
    price: "$300",
    status: "completed",
    rating: 4,
  },
]

export default function Dashboard() {
  const [bookings, setBookings] = useState(mockBookings)
  const [activeMenu, setActiveMenu] = useState(null)

  const handleCancelBooking = (id) => {
    setBookings(bookings.filter((b) => b.id !== id))
    setActiveMenu(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/10 text-primary"
      case "completed":
        return "bg-primary/10 text-primary"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">GreenCircle Dashboard</span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-lg text-muted-foreground">Manage your service bookings and booking history</p>
        </div>

        {bookings.length > 0 ? (
          <>
            {/* Upcoming Bookings */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Services</h2>
              <div className="space-y-4">
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .map((booking) => (
                    <Card key={booking.id} className="p-6 border border-border hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">{booking.provider}</h3>
                          <p className="text-muted-foreground mb-3">{booking.service}</p>

                          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-foreground">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-foreground">{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-foreground">{booking.location}</span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">{booking.price}</div>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                            className="p-2 hover:bg-secondary rounded-lg transition"
                          >
                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                          </button>

                          {activeMenu === booking.id && (
                            <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                              <button className="w-full px-4 py-2 flex items-center gap-2 text-foreground hover:bg-secondary text-sm">
                                <Phone className="w-4 h-4" />
                                Contact Provider
                              </button>
                              <button className="w-full px-4 py-2 flex items-center gap-2 text-foreground hover:bg-secondary text-sm">
                                <Edit className="w-4 h-4" />
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="w-full px-4 py-2 flex items-center gap-2 text-destructive hover:bg-destructive/10 text-sm border-t border-border"
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Completed Bookings */}
            {bookings.filter((b) => b.status === "completed").length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Completed Services</h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.status === "completed")
                    .map((booking) => (
                      <Card key={booking.id} className="p-6 border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">{booking.provider}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{booking.service}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="text-foreground">{booking.date}</span>
                              <span className="text-foreground">{booking.price}</span>

                              {booking.rating ? (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < booking.rating ? "fill-primary text-primary" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                  Leave Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center border border-border">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-6">Start booking eco-friendly services in your community</p>
            <Link href="/browse">
              <Button className="gap-2">
                Browse Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
