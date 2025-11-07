"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Star, MapPin, Filter, Search, Leaf, Locate, X, ChevronDown } from "lucide-react"

// Mock provider data with coordinates
const mockProviders = [
  {
    id: "1",
    name: "Green Thumb Landscaping",
    specialty: "Eco Gardening",
    rating: 4.9,
    reviews: 128,
    location: "San Francisco, CA",
    distance: 2.3,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    image: "/sustainable-landscape.jpg",
  },
  {
    id: "2",
    name: "Sunny Solutions",
    specialty: "Solar Energy",
    rating: 4.8,
    reviews: 95,
    location: "San Francisco, CA",
    distance: 3.1,
    coordinates: { lat: 37.7849, lng: -122.4094 },
    image: "/solar-panels-rooftop.png",
  },
  {
    id: "3",
    name: "Waste Wise Co.",
    specialty: "Waste Management",
    rating: 4.7,
    reviews: 112,
    location: "Oakland, CA",
    distance: 8.5,
    coordinates: { lat: 37.8044, lng: -122.2712 },
    image: "/recycling-composting.jpg",
  },
  {
    id: "4",
    name: "Aqua Flow Systems",
    specialty: "Water Conservation",
    rating: 4.6,
    reviews: 87,
    location: "San Francisco, CA",
    distance: 1.8,
    coordinates: { lat: 37.7649, lng: -122.4294 },
    image: "/water-conservation-hands.png",
  },
  {
    id: "5",
    name: "Energy Audit Experts",
    specialty: "Energy Efficiency",
    rating: 4.5,
    reviews: 64,
    location: "Berkeley, CA",
    distance: 12.2,
    coordinates: { lat: 37.8716, lng: -122.2727 },
    image: "/energy-efficiency.jpg",
  },
  {
    id: "6",
    name: "Community Green Initiative",
    specialty: "Community Programs",
    rating: 4.9,
    reviews: 156,
    location: "San Francisco, CA",
    distance: 4.2,
    coordinates: { lat: 37.7549, lng: -122.4394 },
    image: "/community-garden.png",
  },
]

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [maxDistance, setMaxDistance] = useState(25)
  const [minRating, setMinRating] = useState(0)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [useNearby, setUseNearby] = useState(false)

  const handleGetLocation = () => {
    setLocationLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setUseNearby(true)
          setLocationLoading(false)
        },
        () => {
          setLocationLoading(false)
          alert("Unable to get your location. Please enable location services.")
        },
      )
    } else {
      setLocationLoading(false)
      alert("Geolocation is not supported by your browser.")
    }
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const categories = [
    { id: "all", label: "All Services" },
    { id: "gardening", label: "Eco Gardening" },
    { id: "energy", label: "Energy" },
    { id: "water", label: "Water" },
    { id: "waste", label: "Waste" },
  ]

  const filteredProviders = mockProviders
    .map((provider) => {
      let distance = provider.distance
      if (userLocation && useNearby) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.coordinates.lat,
          provider.coordinates.lng,
        )
      }
      return { ...provider, distance }
    })
    .filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || provider.specialty.toLowerCase().includes(selectedCategory)
      const matchesDistance = provider.distance <= maxDistance
      const matchesRating = provider.rating >= minRating
      return matchesSearch && matchesCategory && matchesDistance && matchesRating
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "distance") return a.distance - b.distance
      return 0
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">GreenCircle</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Services</h1>
          <p className="text-lg text-muted-foreground">Find eco-friendly providers near you</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Main Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search providers or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              onClick={handleGetLocation}
              variant="outline"
              className="gap-2 whitespace-nowrap bg-transparent"
              disabled={locationLoading}
            >
              <Locate className="w-4 h-4" />
              {locationLoading ? "Getting location..." : "Use My Location"}
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Location Status and Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {useNearby && userLocation && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground">Using your location</span>
                <button
                  onClick={() => {
                    setUseNearby(false)
                    setUserLocation(null)
                  }}
                  className="ml-2 p-1 hover:bg-primary/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-secondary transition"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">More Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="p-6 border border-border bg-secondary/30 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Maximum Distance: {maxDistance} mi
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 mi</span>
                  <span>50 mi</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Minimum Rating: {minRating.toFixed(1)} stars
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Any</span>
                  <span>5 stars</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setMaxDistance(25)
                  setMinRating(0)
                  setShowAdvancedFilters(false)
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
          {useNearby && ` near you`}
        </p>

        {/* Provider Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Link key={provider.id} href={`/providers/${provider.id}`}>
                <Card className="h-full border border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={provider.image || "/placeholder.svg"}
                      alt={provider.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{provider.specialty}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating) ? "fill-primary text-primary" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">{provider.rating}</span>
                      <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.distance.toFixed(1)} mi</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border border-border">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No providers found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setMaxDistance(25)
                setMinRating(0)
                setUseNearby(false)
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
