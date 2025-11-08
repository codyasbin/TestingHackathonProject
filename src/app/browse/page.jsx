"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Star, MapPin, Filter, Search, Leaf, Locate, X, ChevronDown, Mic, MicOff, Loader2, Sparkles } from "lucide-react"

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
    keywords: ["garden", "landscaping", "plants", "lawn", "outdoor", "yard"]
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
    keywords: ["solar", "energy", "panels", "electricity", "power", "renewable"]
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
    keywords: ["waste", "recycling", "trash", "garbage", "compost", "disposal"]
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
    keywords: ["water", "plumbing", "conservation", "irrigation", "leak", "pipes"]
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
    keywords: ["energy", "efficiency", "audit", "hvac", "insulation", "heating", "cooling"]
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
    keywords: ["community", "education", "programs", "workshop", "green", "sustainability"]
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
  
  // Voice agent states
  const [agentMode, setAgentMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [agentStatus, setAgentStatus] = useState("idle") // idle, listening, processing, results
  const [voiceResults, setVoiceResults] = useState([])
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set new timeout to process after 2 seconds of silence
        if (finalTranscript) {
          timeoutRef.current = setTimeout(() => {
            processVoiceQuery(finalTranscript.trim())
          }, 1500)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setAgentStatus("idle")
      }

      recognitionRef.current.onend = () => {
        if (agentMode && isListening) {
          // Restart if still in agent mode
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('Error restarting recognition:', e)
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [agentMode, isListening])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setAgentStatus("listening")
      setTranscript("")
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error starting recognition:', e)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }

  const processVoiceQuery = (query) => {
    setAgentStatus("processing")
    stopListening()

    // Simulate processing time
    setTimeout(() => {
      const results = matchProvidersToQuery(query)
      setVoiceResults(results)
      setAgentStatus("results")
    }, 1500)
  }

  const matchProvidersToQuery = (query) => {
    const queryLower = query.toLowerCase()
    const words = queryLower.split(/\s+/)

    return mockProviders
      .map((provider) => {
        let score = 0
        
        // Check name match
        if (provider.name.toLowerCase().includes(queryLower)) score += 10
        
        // Check specialty match
        if (provider.specialty.toLowerCase().includes(queryLower)) score += 8
        
        // Check keyword matches
        words.forEach(word => {
          if (provider.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
            score += 5
          }
          if (provider.name.toLowerCase().includes(word)) score += 3
          if (provider.specialty.toLowerCase().includes(word)) score += 3
        })

        // Calculate distance
        let distance = provider.distance
        if (userLocation && useNearby) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            provider.coordinates.lat,
            provider.coordinates.lng
          )
        }

        return { ...provider, score, distance }
      })
      .filter(provider => provider.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.distance - b.distance
      })
      .slice(0, 6) // Top 6 results
  }

  const toggleAgentMode = () => {
    if (agentMode) {
      // Turning off
      stopListening()
      setAgentMode(false)
      setAgentStatus("idle")
      setTranscript("")
      setVoiceResults([])
    } else {
      // Turning on
      setAgentMode(true)
      setAgentStatus("idle")
    }
  }

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
    const R = 3959
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

  const displayProviders = agentMode ? voiceResults : filteredProviders

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-800">GreenCircle</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Agent Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Services</h1>
            <p className="text-lg text-gray-600">Find eco-friendly providers near you</p>
          </div>
          <Button
            onClick={toggleAgentMode}
            className={`gap-2 ${agentMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            {agentMode ? 'Exit Agent Mode' : 'Find Agent'}
          </Button>
        </div>

        {/* Voice Agent Interface */}
        {agentMode ? (
          <div className="space-y-6">
            {/* Voice Control Card */}
            <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                      isListening ? 'bg-purple-600' : 'bg-gray-300'
                    } transition-colors`}>
                      {isListening ? (
                        <Mic className="w-16 h-16 text-white" />
                      ) : (
                        <MicOff className="w-16 h-16 text-white" />
                      )}
                    </div>
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
                        <div className="absolute inset-0 rounded-full bg-purple-300 animate-ping opacity-50" style={{animationDelay: '0.3s'}}></div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {agentStatus === "idle" && "Ready to help"}
                    {agentStatus === "listening" && "I'm listening..."}
                    {agentStatus === "processing" && "Processing your request..."}
                    {agentStatus === "results" && "Here's what I found"}
                  </h2>
                  <p className="text-gray-600">
                    {agentStatus === "idle" && "Click the microphone to start speaking"}
                    {agentStatus === "listening" && "Tell me what service you're looking for"}
                    {agentStatus === "processing" && "Searching for the best matches"}
                    {agentStatus === "results" && `Found ${voiceResults.length} matching providers`}
                  </p>
                </div>

                {/* Transcript Display */}
                {transcript && agentStatus === "listening" && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-500 mb-1">You said:</p>
                    <p className="text-lg text-gray-800 font-medium">{transcript}</p>
                  </div>
                )}

                {/* Processing Animation */}
                {agentStatus === "processing" && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}

                {/* Control Button */}
                {agentStatus !== "processing" && (
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    size="lg"
                    className={`gap-2 ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Voice Search
                      </>
                    )}
                  </Button>
                )}

                {/* Try Again Button */}
                {agentStatus === "results" && (
                  <Button
                    onClick={() => {
                      setAgentStatus("idle")
                      setTranscript("")
                      setVoiceResults([])
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Try Another Search
                  </Button>
                )}
              </div>
            </Card>

            {/* Results Display */}
            {agentStatus === "results" && (
              <>
                {voiceResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Based on your request: <span className="font-semibold">"{transcript}"</span>
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {voiceResults.map((provider) => (
                        <Link key={provider.id} href={`/provider/${provider.id}`}>
                          <Card className="h-full border hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer overflow-hidden">
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              <img
                                src={provider.image || "/placeholder.svg"}
                                alt={provider.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{provider.name}</h3>
                              <p className="text-xs text-gray-500 mb-3">{provider.specialty}</p>

                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(provider.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{provider.rating}</span>
                                <span className="text-xs text-gray-500">({provider.reviews})</span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span>{provider.distance.toFixed(1)} mi</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="p-12 text-center border border-gray-200">
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No matches found</h3>
                    <p className="text-gray-600 mb-6">Try describing the service you need in a different way</p>
                  </Card>
                )}
              </>
            )}
          </div>
        ) : (
          /* Normal Browse Mode */
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button
                  onClick={handleGetLocation}
                  variant="outline"
                  className="gap-2 whitespace-nowrap"
                  disabled={locationLoading}
                >
                  <Locate className="w-4 h-4" />
                  {locationLoading ? "Getting location..." : "Use My Location"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      selectedCategory === category.id
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 text-gray-700 hover:border-green-400"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {useNearby && userLocation && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Using your location</span>
                    <button
                      onClick={() => {
                        setUseNearby(false)
                        setUserLocation(null)
                      }}
                      className="ml-2 p-1 hover:bg-green-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">More Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>

              {showAdvancedFilters && (
                <Card className="p-6 border bg-gray-50 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>1 mi</span>
                      <span>50 mi</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
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

            <p className="text-sm text-gray-600 mb-6">
              Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
              {useNearby && ` near you`}
            </p>

            {filteredProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <Link key={provider.id} href={`/provider/${provider.id}`}>
                    <Card className="h-full border hover:shadow-lg hover:border-green-300 transition-all cursor-pointer overflow-hidden">
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={provider.image || "/placeholder.svg"}
                          alt={provider.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{provider.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{provider.specialty}</p>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(provider.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{provider.rating}</span>
                          <span className="text-xs text-gray-500">({provider.reviews})</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.distance.toFixed(1)} mi</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No providers found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
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
          </>
        )}
      </div>
    </div>
  )
}