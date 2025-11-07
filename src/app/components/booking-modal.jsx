"use client"

import { useState } from "react"

export default function BookingModal({ provider, onClose, onBook }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "2",
    description: "",
    name: "",
    phone: "",
    address: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onBook(formData)
    alert("Booking request sent! You will receive a confirmation shortly.")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Book {provider.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration (hours)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="fullday">Full day (8 hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Service Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="Where you need the service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Describe Your Need</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground h-24 resize-none"
              placeholder="Describe the service you need..."
            />
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Rate: ${provider.price}/hr</span>
              <span>Duration: {formData.duration} hours</span>
            </div>
            <div className="text-lg font-bold text-primary">
              Estimated: $
              {formData.duration === "fullday"
                ? provider.price * 8
                : provider.price * Number.parseInt(formData.duration)}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Confirm Booking
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-3 rounded-lg font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
