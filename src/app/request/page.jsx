"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Tag, Phone, Mail, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"
import { addPoints } from "@/utils/couponUtils"
import Header from "../components/header"

export default function ProviderRequestsPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState("pending") // pending, confirmed, rejected, all
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser")
      if (user) {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)
        loadRequests(parsedUser.id)
      } else {
        setLoading(false)
      }
    }
  }, [])

  const loadRequests = async (providerId) => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/bookings/provider/${providerId}`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      } else {
        toast.error("Failed to load booking requests")
      }
    } catch (error) {
      console.error("Error loading requests:", error)
      toast.error("Failed to load booking requests")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (currentUser) {
      setRefreshing(true)
      loadRequests(currentUser.id)
    }
  }

  const handleAcceptRequest = async (request) => {
    if (!currentUser) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${request._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' })
      })

      const result = await response.json()

      if (result.success) {
        // Award points to customer for completed booking
        addPoints(request.customerId, 250, "Booking confirmed by provider")

        // Reload requests
        loadRequests(currentUser.id)

        toast.success("Booking request accepted! Customer will be notified.")
      } else {
        toast.error(result.error || "Failed to accept booking")
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      toast.error("Failed to accept booking request")
    }
  }

  const handleRejectRequest = async (request) => {
    if (!currentUser) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${request._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      })

      const result = await response.json()

      if (result.success) {
        // Reload requests
        loadRequests(currentUser.id)

        toast.info("Booking request rejected. Customer will be notified.")
      } else {
        toast.error(result.error || "Failed to reject booking")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Failed to reject booking request")
    }
  }

  const filteredRequests = filter === "all" 
    ? requests 
    : requests.filter(r => r.status === filter)

  const pendingCount = requests.filter(r => r.status === "pending").length
  const confirmedCount = requests.filter(r => r.status === "confirmed").length
  const rejectedCount = requests.filter(r => r.status === "rejected").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
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
            <p className="text-gray-600">Please login to view your booking requests</p>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Requests</h1>
            <p className="text-gray-600">Manage your customer booking requests</p>
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
            All ({requests.length})
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No {filter} requests</h3>
            <p className="text-gray-500">
              {filter === "pending" 
                ? "You don't have any pending booking requests at the moment."
                : `No ${filter} bookings to display.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request._id} className="p-6 border-2 border-emerald-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Request Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{request.service}</h3>
                        <p className="text-sm text-gray-500">Booking ID: {request.confirmationId}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          request.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : request.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status === "pending" && "⏳ Pending"}
                        {request.status === "confirmed" && "✓ Confirmed"}
                        {request.status === "rejected" && "✗ Rejected"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-600">Customer</p>
                          <p className="font-semibold text-gray-800">{request.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Date & Time</p>
                          <p className="font-semibold text-gray-800 text-sm">{request.date}</p>
                          <p className="text-xs text-gray-600">{request.time}</p>
                        </div>
                      </div>

                      {request.customerEmail && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="font-medium text-gray-800 text-sm">{request.customerEmail}</p>
                          </div>
                        </div>
                      )}

                      {request.customerPhone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-600">Phone</p>
                            <p className="font-medium text-gray-800">{request.customerPhone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Payment Method</p>
                        <p className="font-semibold text-gray-800 capitalize">{request.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">NPR {request.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {request.coupon && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Tag className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-700">
                          Coupon applied: <span className="font-semibold">{request.coupon.title}</span> (-NPR {request.discount})
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Created: {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {request.status === "pending" && (
                    <div className="flex flex-col gap-3 lg:w-48">
                      <Button
                        onClick={() => handleAcceptRequest(request)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request)}
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.status === "confirmed" && (
                    <div className="lg:w-48 flex items-center justify-center">
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-green-700">Accepted</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.acceptedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {request.status === "rejected" && (
                    <div className="lg:w-48 flex items-center justify-center">
                      <div className="text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-red-700">Rejected</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.rejectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}