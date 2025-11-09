"use client";

import {useState, useEffect, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import Link from "next/link";
import {Star, MapPin, Filter, Search, Leaf, Locate, X, ChevronDown, Mic, MicOff, Loader2, Sparkles, Navigation, CheckCircle} from "lucide-react";
import {ServiceProviders} from "@/data/ServiceProvider";
import Header from "../components/header";
import Footer from "../components/footer";




const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [maxDistance, setMaxDistance] = useState(25);
  const [minRating, setMinRating] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [useNearby, setUseNearby] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  const [agentMode, setAgentMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentStatus, setAgentStatus] = useState("idle");
  const [voiceResults, setVoiceResults] = useState([]);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      setTranscript(final || interim);

      if (final) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => processVoiceQuery(final.trim()), 1500);
      }
    };

    rec.onerror = () => {
      setIsListening(false);
      setAgentStatus("idle");
    };

    rec.onend = () => {
      if (agentMode && isListening) {
        try {
          rec.start();
        } catch (_) {}
      }
    };

    recognitionRef.current = rec;

    return () => {
      rec.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [agentMode, isListening]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setAgentStatus("listening");
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const processVoiceQuery = (query) => {
    setAgentStatus("processing");
    stopListening();
    setTimeout(() => {
      const results = matchProvidersToQuery(query);
      setVoiceResults(results);
      setAgentStatus("results");
    }, 1500);
  };

  const matchProvidersToQuery = (query) => {
    const q = query.toLowerCase();
    const words = q.split(/\s+/);

    return ServiceProviders.map((p) => {
      let score = 0;
      if (p.name.toLowerCase().includes(q)) score += 10;
      if (p.service.toLowerCase().includes(q)) score += 8;
      words.forEach((w) => {
        if (p.keywords.some((k) => k.toLowerCase().includes(w))) score += 5;
        if (p.name.toLowerCase().includes(w)) score += 3;
        if (p.service.toLowerCase().includes(w)) score += 3;
      });

      let distance = 999;
      if (userLocation && useNearby) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng);
      }

      return {...p, score, distance, ratingCount: p.reviews.length};
    })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score || a.distance - b.distance)
      .slice(0, 6);
  };

  const toggleAgentMode = () => {
    if (agentMode) {
      stopListening();
      setAgentMode(false);
      setAgentStatus("idle");
      setTranscript("");
      setVoiceResults([]);
    } else {
      setAgentMode(true);
      setAgentStatus("idle");
    }
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    // Check permission status if available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.onchange = () => {
          setLocationPermission(permission.state);
        };
      } catch (err) {
        console.log("Permission API not available");
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(coords);
        setUseNearby(true);
        setLocationLoading(false);
        setLocationPermission('granted');
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = "Unable to get your location. ";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location permission was denied. Please enable location access in your browser settings.";
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "The request to get your location timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const categories = [
    {id: "all", label: "All Services"},
    {id: "solar", label: "Solar Energy"},
    {id: "tailoring", label: "Tailoring"},
    {id: "makeup", label: "Makeup & Beauty"},
    {id: "plumbing", label: "Plumbing"},
    {id: "carpentry", label: "Carpentry"},
    {id: "appliance", label: "Appliance Repair"},
  ];

  const filteredProviders = ServiceProviders.map((p) => {
    let distance = 999;
    if (userLocation && useNearby) {
      distance = calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng);
    }
    return {...p, distance, ratingCount: p.reviews.length};
  })
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.service.toLowerCase().includes(q) || p.keywords.some((k) => k.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "all" || p.service.toLowerCase().includes(selectedCategory) || p.keywords.some((k) => k.toLowerCase().includes(selectedCategory));

      const matchesDistance = !useNearby || p.distance <= maxDistance;
      const matchesRating = p.rating >= minRating;

      return matchesSearch && matchesCategory && matchesDistance && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "distance") return a.distance - b.distance;
      return 0;
    });

  const displayProviders = agentMode ? voiceResults : filteredProviders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-800">GreenCircle</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back Home
            </Button>
          </Link>
        </div>
      </nav> */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Services</h1>
            <p className="text-lg text-gray-600">Find eco-friendly providers near you</p>
          </div>
          <Button onClick={toggleAgentMode} className={`gap-2 ${agentMode ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}`} size="lg">
            <Sparkles className="w-5 h-5" />
            {agentMode ? "Exit Agent Mode" : "Find Agent"}
          </Button>
        </div>

        {agentMode ? (
          <div className="space-y-6">
            <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className={`relative ${isListening ? "animate-pulse" : ""}`}>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isListening ? "bg-purple-600" : "bg-gray-300"} transition-colors`}>
                      {isListening ? <Mic className="w-16 h-16 text-white" /> : <MicOff className="w-16 h-16 text-white" />}
                    </div>
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
                        <div className="absolute inset-0 rounded-full bg-purple-300 animate-ping opacity-50" style={{animationDelay: "0.3s"}}></div>
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

                {transcript && agentStatus === "listening" && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-500 mb-1">You said:</p>
                    <p className="text-lg text-gray-800 font-medium">{transcript}</p>
                  </div>
                )}

                {agentStatus === "processing" && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    </div>
                  </div>
                )}

                {agentStatus !== "processing" && (
                  <Button onClick={isListening ? stopListening : startListening} size="lg" className={`gap-2 ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}>
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

                {agentStatus === "results" && (
                  <Button
                    onClick={() => {
                      setAgentStatus("idle");
                      setTranscript("");
                      setVoiceResults([]);
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

            {agentStatus === "results" && (
              <>
                {voiceResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Based on your request: <span className="font-semibold">"{transcript}"</span>
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {voiceResults.map((p) => (
                        <Link key={p.id} href={`/provider/${p.id}`}>
                          <Card className="h-full border hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer overflow-hidden">
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{p.name}</h3>
                              <p className="text-xs text-gray-500 mb-3">{p.service}</p>

                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{p.rating}</span>
                                <span className="text-xs text-gray-500">({p.ratingCount})</span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span>{p.distance.toFixed(1)} km</span>
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
          <>
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <Button 
                  onClick={handleGetLocation} 
                  variant="outline" 
                  className={`gap-2 whitespace-nowrap ${locationLoading ? 'border-green-500' : ''}`}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Getting location...</span>
                      <span className="sm:hidden">Locating...</span>
                    </>
                  ) : userLocation && useNearby ? (
                    <>
                      <Navigation className="w-4 h-4 text-green-600" />
                      Location Active
                    </>
                  ) : (
                    <>
                      <Locate className="w-4 h-4" />
                      Use My Location
                    </>
                  )}
                </Button>
              </div>

              {/* Location Status Card */}
              {locationError && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-1">Location Error</p>
                      <p className="text-xs text-red-700">{locationError}</p>
                    </div>
                    <button
                      onClick={() => setLocationError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              )}

              {userLocation && useNearby && !locationError && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 mb-1">Location Active</p>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>Latitude: {userLocation.lat.toFixed(6)}°</p>
                        <p>Longitude: {userLocation.lng.toFixed(6)}°</p>
                        {userLocation.accuracy && (
                          <p>Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUseNearby(false);
                        setUserLocation(null);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              )}

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      selectedCategory === c.id ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-700 hover:border-green-400"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                <div className="relative">
                  <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">More Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest First</option>
                </select>

                {useNearby && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Showing within {maxDistance}km</span>
                  </div>
                )}
              </div>  

              {showAdvancedFilters && (
                <Card className="p-6 border bg-gray-50 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Maximum Distance: {maxDistance} km
                      {!useNearby && <span className="text-xs text-gray-500 ml-2">(Enable location to use)</span>}
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={maxDistance} 
                      onChange={(e) => setMaxDistance(Number(e.target.value))} 
                      className="w-full accent-green-600"
                      disabled={!useNearby}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating: {minRating.toFixed(1)} stars</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.5" 
                      value={minRating} 
                      onChange={(e) => setMinRating(Number(e.target.value))} 
                      className="w-full accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Any rating</span>
                      <span>5 stars only</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setMaxDistance(25);
                      setMinRating(0);
                      setShowAdvancedFilters(false);
                    }}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </Card>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
                {useNearby && " near you"}
                {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
              </p>
              {filteredProviders.length > 0 && useNearby && (
                <p className="text-xs text-gray-500">
                  Closest: {Math.min(...filteredProviders.map(p => p.distance)).toFixed(1)}km away
                </p>
              )}
            </div>

            {filteredProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((p) => (
                  <Link key={p.id} href={`/provider/${p.id}`}>
                    <Card className="h-full border hover:shadow-lg hover:border-green-300 transition-all cursor-pointer overflow-hidden group">
                      <div className="aspect-video overflow-hidden bg-gray-100 relative">
                        <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {p.verification && (
                          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                        {useNearby && p.distance < 2 && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            Nearby
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{p.service}</p>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{p.rating}</span>
                          <span className="text-xs text-gray-500">({p.ratingCount})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{useNearby ? `${p.distance.toFixed(1)} km away` : p.city}</span>
                          </div>
                          <div className="text-xs font-medium text-green-600">
                            {p.rate}
                          </div>
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
                <p className="text-gray-600 mb-6">
                  {useNearby 
                    ? `No providers found within ${maxDistance}km of your location. Try increasing the distance range.`
                    : "Try adjusting your search or filters"
                  }
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setMaxDistance(25);
                      setMinRating(0);
                    }}
                  >
                    Clear Filters
                  </Button>
                  {useNearby && maxDistance < 50 && (
                    <Button
                      onClick={() => setMaxDistance(50)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Expand to 50km
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}