"use client";

import {useState, useEffect, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import Link from "next/link";
import {Star, MapPin, Filter, Search, Leaf, Locate, X, ChevronDown, Mic, MicOff, Loader2, Sparkles} from "lucide-react";
import {ServiceProviders} from "@/data/ServiceProvider";

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
      } else if (p.location) {
        const m = p.location.match(/([\d.]+)km/);
        if (m) distance = parseFloat(m[1]) * 0.621371;
      }

      return {...p, score, distance};
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

  const handleGetLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({lat: pos.coords.latitude, lng: pos.coords.longitude});
          setUseNearby(true);
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
          alert("Unable to get your location.");
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation not supported.");
    }
  };

  const categories = [
    {id: "all", label: "All Services"},
    {id: "solar", label: "Solar Energy"},
    {id: "tailoring", label: "Tailoring"},
    {id: "makeup", label: "Bridal Makeup"},
  ];

  const filteredProviders = ServiceProviders.map((p) => {
    let distance = 999;
    if (userLocation && useNearby) {
      distance = calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng);
    } else if (p.location) {
      const m = p.location.match(/([\d.]+)km/);
      if (m) distance = parseFloat(m[1]) * 0.621371;
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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50">
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
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
      </nav>

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
            <Card className="p-8 border-2 border-purple-200 bg-linear-to-br from-purple-50 to-blue-50">
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
                                <span>{p.distance.toFixed(1)} mi</span>
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
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button onClick={handleGetLocation} variant="outline" className="gap-2 whitespace-nowrap" disabled={locationLoading}>
                  <Locate className="w-4 h-4" />
                  {locationLoading ? "Getting location..." : "Use My Location"}
                </Button>
              </div>

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

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {useNearby && userLocation && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Using your location</span>
                    <button
                      onClick={() => {
                        setUseNearby(false);
                        setUserLocation(null);
                      }}
                      className="ml-2 p-1 hover:bg-green-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">More Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>

              {showAdvancedFilters && (
                <Card className="p-6 border bg-gray-50 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Maximum Distance: {maxDistance} mi</label>
                    <input type="range" min="1" max="50" value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>1 mi</span>
                      <span>50 mi</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating: {minRating.toFixed(1)} stars</label>
                    <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Any</span>
                      <span>5 stars</span>
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

            <p className="text-sm text-gray-600 mb-6">
              Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
              {useNearby && " near you"}
            </p>

            {filteredProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((p) => (
                  <Link key={p.id} href={`/provider/${p.id}`}>
                    <Card className="h-full border hover:shadow-lg hover:border-green-300 transition-all cursor-pointer overflow-hidden">
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
                          <span>{useNearby ? `${p.distance.toFixed(1)} mi` : p.location}</span>
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
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setMaxDistance(25);
                    setMinRating(0);
                    setUseNearby(false);
                    setUserLocation(null);
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
  );
}
