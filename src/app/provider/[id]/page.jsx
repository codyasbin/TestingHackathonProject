"use client";

import {useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import BookingModal from "@/app/components/booking-modal";
import {ServiceProviders} from "@/data/ServiceProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ✅ lucide-react icons
import {ArrowLeft, Star, CheckCircle, Leaf, MapPin, MessageCircle, ShieldCheck, Clock, Globe, DollarSign} from "lucide-react";

const allProviders = ServiceProviders;

export default function ProviderDetail() {
  const params = useParams();
  const providerId = Number.parseInt(params.id, 10);
  const provider = allProviders.find((p) => p.id === providerId);

  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const router = useRouter();

  const expressBaseUrl =  "http://localhost:3001";


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
        // console.log("Online meeting initiated:", data);
        toast.success("Online meeting request sent successfully");
        router.push("/online-room");
        
      } catch (error) {
        console.error("Error initiating online meeting:", error);
      }
    }

    initiateOnlineMeeting();
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <Link href="/browse" className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column – Provider Info */}
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex gap-6 mb-6">
                  <img src={provider.image || "/placeholder.svg"} alt={provider.name} className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                      {provider.verification && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          <CheckCircle size={12} /> Verified
                        </span>
                      )}
                    </div>

                    <p className="text-primary capitalize font-medium mb-2">{provider.service}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400" />
                        {provider.rating} ({provider.ratingCount} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {provider.location} away
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {provider.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground">{provider.about}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Leaf size={16} className="text-green-600" />
                      Sustainability Commitment
                    </h3>
                    <p className="text-muted-foreground">{provider.sustainability}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe size={12} /> Languages
                      </p>
                      <p className="font-medium text-foreground">{languages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign size={12} /> Rate
                      </p>
                      <p className="font-medium text-primary text-lg">{rate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="text-yellow-400" /> Customer Reviews
                </h2>
                <div className="space-y-4">
                  {provider.reviews?.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{review.reviewer}</span>
                        <span className="text-yellow-400">{"★".repeat(Math.round(review.rating))}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column – Booking */}
            <div className="md:col-span-1">
              <div className="bg-primary text-primary-foreground rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-1">
                  <ShieldCheck size={16} /> Book This Service
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-semibold">{rate}</span>
                  </div>
                  <div className="text-sm opacity-80">
                    <p>Average service duration: {provider.duration ?? "1–2 hours"}</p>
                  </div>
                </div>

                <button onClick={() => setShowBooking(true)} className="w-full bg-primary-foreground text-primary py-3 rounded-lg font-semibold hover:opacity-90 transition mb-3">
                  Request Booking
                </button>

                <button onClick={handleClickOnlineMeet} className="w-full cursor-pointer border-2 border-primary-foreground py-2 rounded-lg text-primary-foreground hover:bg-primary-foreground/10 transition flex items-center justify-center gap-1">
                  <MessageCircle size={16} /> Request Online Meet
                </button>

                <div className="mt-6 pt-6 border-t border-primary-foreground/20 text-xs opacity-80 space-y-1">
                  <p>✅ Verified provider</p>
                  <p>🔒 Secured payments</p>
                  <p>💰 Money-back guarantee</p>
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
