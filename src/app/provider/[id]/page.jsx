"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import BookingModal from "@/app/components/booking-modal";
import {ServiceProviders} from "@/data/ServiceProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ✅ lucide-react icons
import {
  ArrowLeft, 
  Star, 
  CheckCircle, 
  Leaf, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  Globe, 
  DollarSign,
  Send,
  User,
  Award,
  ThumbsUp
} from "lucide-react";

const allProviders = ServiceProviders;

export default function ProviderDetail() {
  const params = useParams();
  const providerId = Number.parseInt(params.id, 10);
  const provider = allProviders.find((p) => p.id === providerId);

  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const expressBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Load reviews from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get current user
      const user = localStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }

      // Get reviews for this provider
      const allReviews = JSON.parse(localStorage.getItem("providerReviews") || "{}");
      const providerReviews = allReviews[providerId] || [];
      
      // Combine with default reviews
      const combinedReviews = [
        ...providerReviews,
        ...(provider?.reviews || [])
      ];
      
      setReviews(combinedReviews);
    }
  }, [providerId, provider]);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : provider?.rating || 0;

  const handleClickOnlineMeet = () => {
    async function initiateOnlineMeeting() {
      try {
        const response = await fetch(`${expressBaseUrl}/api/incoming-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incomingCall: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initiate online meeting");
        }

        const data = await response.json();
        toast.success("Online meeting request sent successfully");
        router.push("/online-room");
      } catch (error) {
        console.error("Error initiating online meeting:", error);
        toast.error("Failed to initiate meeting");
      }
    }

    initiateOnlineMeeting();
  };

  const handleSubmitReview = () => {
    if (!currentUser) {
      toast.error("Please login to leave a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = {
        id: `review_${Date.now()}`,
        reviewer: currentUser.name,
        rating: rating,
        comment: reviewText.trim(),
        date: new Date().toISOString(),
        userId: currentUser.id,
        helpful: 0
      };

      // Get all reviews from localStorage
      const allReviews = JSON.parse(localStorage.getItem("providerReviews") || "{}");
      
      // Add new review for this provider
      if (!allReviews[providerId]) {
        allReviews[providerId] = [];
      }
      allReviews[providerId].unshift(newReview);

      // Save back to localStorage
      localStorage.setItem("providerReviews", JSON.stringify(allReviews));

      // Update local state
      setReviews([newReview, ...reviews]);

      // Reset form
      setRating(0);
      setReviewText("");
      setShowReviewForm(false);

      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = (reviewId) => {
    try {
      const allReviews = JSON.parse(localStorage.getItem("providerReviews") || "{}");
      const providerReviews = allReviews[providerId] || [];
      
      const updatedReviews = providerReviews.map(review => {
        if (review.id === reviewId) {
          return { ...review, helpful: (review.helpful || 0) + 1 };
        }
        return review;
      });

      allReviews[providerId] = updatedReviews;
      localStorage.setItem("providerReviews", JSON.stringify(allReviews));

      // Update local state
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return { ...review, helpful: (review.helpful || 0) + 1 };
        }
        return review;
      }));

      toast.success("Marked as helpful!");
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Provider not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const rate = provider.rate ?? provider.Rate;
  const languages = provider.languages ?? provider.Languages;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Breadcrumb */}
          <Link 
            href="/browse" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={18} /> 
            <span>Back to Services</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column – Provider Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Card */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="relative">
                    <img 
                      src={provider.image || "/placeholder.svg"} 
                      alt={provider.name} 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg ring-4 ring-emerald-100" 
                    />
                    {provider.verification && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-3">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">{provider.name}</h1>
                      <p className="text-emerald-600 capitalize font-semibold text-lg flex items-center gap-2">
                        <Award size={18} />
                        {provider.service}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-amber-700">{averageRating}</span>
                        <span className="text-gray-500">({reviews.length} reviews)</span>
                      </div>
                      <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full text-emerald-700">
                        <MapPin size={14} /> {provider.location}
                      </span>
                      <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700">
                        <Clock size={14} /> {provider.time}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200">
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <Globe size={12} /> Languages
                        </p>
                        <p className="font-semibold text-gray-800">{languages}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200">
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <DollarSign size={12} /> Rate
                        </p>
                        <p className="font-bold text-emerald-600 text-xl">{rate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">About</h3>
                    <p className="text-gray-600 leading-relaxed">{provider.about}</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Leaf size={18} className="text-green-600" />
                      Sustainability Commitment
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{provider.sustainability}</p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Star className="text-amber-400 fill-amber-400" /> 
                    Customer Reviews
                  </h2>
                  {currentUser && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Write Review
                    </button>
                  )}
                </div>

                {/* Rating Summary */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-amber-600 mb-2">{averageRating}</div>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={`${
                              star <= Math.round(averageRating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">Based on {reviews.length} reviews</p>
                    </div>

                    <div className="space-y-2">
                      {ratingDistribution.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-12">{star} star</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mb-6 border border-emerald-200">
                    <h3 className="font-bold text-gray-800 mb-4">Share Your Experience</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              size={32}
                              className={`${
                                star <= (hoverRating || rating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this service provider..."
                        rows={4}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setRating(0);
                          setReviewText("");
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                              {review.reviewer.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">{review.reviewer}</span>
                              {review.date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${
                                  star <= Math.round(review.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                        
                        {review.id && (
                          <button
                            onClick={() => handleMarkHelpful(review.id)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                          >
                            <ThumbsUp size={14} />
                            <span>Helpful {review.helpful > 0 ? `(${review.helpful})` : ""}</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column – Booking */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-2xl sticky top-20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ShieldCheck size={20} /> 
                  Book This Service
                </h3>

                <div className="space-y-4 mb-6 bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hourly Rate:</span>
                    <span className="text-2xl font-bold">{rate}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      Average: {provider.duration ?? "1–2 hours"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => setShowBooking(true)} 
                    className="w-full bg-white text-emerald-600 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Request Booking
                  </button>

                  <button 
                    onClick={handleClickOnlineMeet} 
                    className="w-full border-2 border-white py-3 rounded-xl text-white font-semibold hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> 
                    Online Consultation
                  </button>
                </div>

                <div className="space-y-2 pt-6 border-t border-white/20 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Verified provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>Secured payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf size={16} />
                    <span>Eco-friendly service</span>
                  </div>
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
            setBookingData(data);
            setShowBooking(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}