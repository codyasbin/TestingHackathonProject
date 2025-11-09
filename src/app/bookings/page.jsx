"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Calendar, DollarSign, Tag, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"
import Header from "../components/header"

export default function CustomerBookingsPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState("all") // all, pending, confirmed, rejected
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser")
      if (user) {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)
        loadBookings()
      } else {
        setLoading(false)
      }
    }
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/bookings`)
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
      } else {
        toast.error("Failed to load bookings")
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (currentUser) {
      setRefreshing(true)
      loadBookings()
    }
  }

  const handleCancelBooking = (id) => {
    async function cancel() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/bookings/${id}`, {
          method: "DELETE",
        })
        const result = await response.json()

        if (result.success) {
          toast.success("Booking cancelled successfully")
          loadBookings()
        }
      } catch (error) {
        console.error("Error cancelling booking:", error)
        toast.error("Failed to cancel booking")
      }
    }

    cancel()
  }

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const pendingCount = bookings.filter(b => b.status === "pending").length
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length
  const rejectedCount = bookings.filter(b => b.status === "rejected").length

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="w-5 h-5" />,
          color: "amber",
          label: "Pending Approval",
          description: "Waiting for provider to accept"
        }
      case "confirmed":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: "green",
          label: "Confirmed",
          description: "Provider has accepted your booking"
        }
      case "rejected":
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: "red",
          label: "Rejected",
          description: "Provider couldn't accept this booking"
        }
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: "gray",
          label: status,
          description: ""
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <p className="text-gray-600">Please login to view your bookings</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
            <p className="text-gray-600">Track and manage your service bookings</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-emerald-400"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "pending"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-amber-400"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "confirmed"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-green-400"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "rejected"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-red-400"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {filter === "all" ? "" : filter} bookings
            </h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "You haven't made any bookings yet. Book a service to get started!"
                : `No ${filter} bookings to display.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status)
              return (
                <Card key={booking._id} className="p-6 border-2 border-emerald-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                                        <div className="flex-1 space-y-4">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.service}</h3>
                                              <p className="text-sm text-gray-500">Booking ID: {booking.confirmationId}</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${statusInfo.color}-100`}>
                                                <span className={`text-${statusInfo.color}-700`}>{statusInfo.icon}</span>
                                                <span className={`text-sm font-semibold text-${statusInfo.color}-700`}>
                                                  {statusInfo.label}
                                                </span>
                                              </div>

                                              {booking.status === "pending" && (
                                                <button
                                                  onClick={() => handleCancelBooking(booking._id)}
                                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-100 shadow-sm hover:bg-red-100 hover:shadow-md transition transform active:scale-95"
                                                  title="Cancel booking"
                                                >
                                                  <XCircle className="w-4 h-4" />
                                                  <span className="text-sm font-medium">Cancel</span>
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                              <p className="text-xs text-gray-600 mb-1">Service Provider</p>
                                              <p className="font-semibold text-gray-800">{booking.provider}</p>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-lg">
                                              <p className="text-xs text-gray-600 mb-1">Scheduled For</p>
                                              <p className="font-semibold text-gray-800">{booking.date}</p>
                                              <p className="text-sm text-gray-600">{booking.time}</p>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-lg">
                                              <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                                              <p className="font-semibold text-gray-800 capitalize">{booking.paymentMethod}</p>
                                            </div>

                                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                              <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                                              <p className="text-2xl font-bold text-emerald-600">NPR {booking.total.toFixed(2)}</p>
                                            </div>
                                          </div>

                                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Price</span>
                            <span className="text-gray-800">NPR {booking.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-800">NPR {booking.tax.toFixed(2)}</span>
                          </div>
                          {booking.discount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Discount
                              </span>
                              <span className="font-semibold">-NPR {booking.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t font-semibold">
                            <span className="text-gray-800">Total</span>
                            <span className="text-emerald-600">NPR {booking.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {booking.coupon && (
                        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-semibold text-purple-700">{booking.coupon.title}</p>
                            <code className="text-xs text-purple-600 font-mono">{booking.coupon.code}</code>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Booked on {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Right: Status Info */}
                    <div className="lg:w-64 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className={`w-16 h-16 rounded-full bg-${statusInfo.color}-100 flex items-center justify-center mb-4`}>
                        <span className={`text-${statusInfo.color}-600`}>{statusInfo.icon}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{statusInfo.label}</h4>
                      <p className="text-sm text-gray-600 text-center mb-4">{statusInfo.description}</p>
                      
                      {booking.status === "pending" && (
                        <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700 text-center">
                            ⏳ The provider will review your request soon. You'll be notified once they respond.
                          </p>
                        </div>
                      )}

                      {booking.status === "confirmed" && (
                        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-700 text-center">
                            ✓ Your booking is confirmed! The provider will contact you soon.
                          </p>
                          {booking.acceptedAt && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Confirmed on {new Date(booking.acceptedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {booking.status === "rejected" && (
                        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 text-center">
                            The provider couldn't accept this booking. Please try booking another provider.
                          </p>
                          {booking.rejectedAt && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Rejected on {new Date(booking.rejectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}