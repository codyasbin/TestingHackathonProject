"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2, ArrowRight } from "lucide-react"

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    // Get booking data from URL params or localStorage
    const params = new URLSearchParams(window.location.search)
    const bookingData = {
      confirmationId: params.get("id") || "BC-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      provider: {
        name: "Green Thumb Landscaping",
        phone: "(415) 555-0123",
        email: "contact@greenthumb.com",
        location: "San Francisco, CA",
      },
      service: "Organic Garden Setup",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: "10:00 AM",
      price: "$800",
      status: "confirmed",
    }
    setBooking(bookingData)
  }, [])

  const handleDownloadReceipt = () => {
    const content = `
Booking Confirmation Receipt
============================

Confirmation ID: ${booking?.confirmationId}
Status: ${booking?.status}

Provider: ${booking?.provider.name}
Service: ${booking?.service}
Date: ${booking?.date}
Time: ${booking?.time}
Price: ${booking?.price}

Contact:
Phone: ${booking?.provider.phone}
Email: ${booking?.provider.email}
Location: ${booking?.provider.location}

Important: Please confirm your appointment 24 hours before the scheduled time.
    `
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `booking-${booking?.confirmationId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading confirmation...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground">Your service has been successfully booked</p>
        </div>

        {/* Confirmation Details */}
        <Card className="p-8 border border-border mb-8">
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">Confirmation ID</p>
            <p className="text-2xl font-mono font-bold text-foreground">{booking.confirmationId}</p>
          </div>

          {/* Provider Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Provider Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="text-lg font-semibold text-foreground">{booking.provider.name}</p>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{booking.provider.location}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <a href={`tel:${booking.provider.phone}`} className="hover:underline">
                  {booking.provider.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${booking.provider.email}`} className="hover:underline">
                  {booking.provider.email}
                </a>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Booking Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="text-lg font-semibold text-foreground">{booking.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-semibold text-foreground">{booking.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </p>
                <p className="text-lg font-semibold text-foreground">{booking.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-lg font-semibold text-foreground">{booking.time}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="font-semibold text-primary capitalize">{booking.status}</p>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-6 border border-border mb-8 bg-secondary/20">
          <h3 className="font-bold text-foreground mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• A confirmation email has been sent to your registered email address</li>
            <li>• Please confirm your appointment 24 hours before the scheduled time</li>
            <li>• If you need to reschedule, contact the provider directly</li>
            <li>• Keep your confirmation ID handy for reference</li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 gap-2" onClick={handleDownloadReceipt}>
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1 gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            Share Booking
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <ArrowRight className="w-4 h-4" />
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
