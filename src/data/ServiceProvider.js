import {Languages} from "lucide-react";

export const ServiceProviders = [
  {
    id: 1,
    name: "Ramesh Electrical Services",
    service: "Solar Fitting",
    verification: true,
    rating: 4.5,
    email: "john@gmail.com",
    phone: "+977-12345678",
    location: "0.8km",
    city: "Kathmandu",
    coordinates: {lat: 27.7172, lng: 85.3240}, // Thamel
    image: "https://images.unsplash.com/photo-1659353588580-8da374e328a1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    about: "I provide comprehensive electrical solutions for residential and commercial properties. Specializing in solar installations and repairs.",
    sustainability: "Uses eco-friendly materials and energy-efficient fixtures",
    keywords: ["electrical", "solar", "repairs", "installations", "conservation"],
    languages: "Nepali, Hindi, English",
    rate: "Nrs 1000 per hour",
    reviews: [
      {id: 1, reviewer: "Adil Poudel", rating: 4.5, comment: "Great experience with Ramesh's electrical service! Highly recommended."},
      {id: 2, reviewer: "Anugya Acharya", rating: 4.0, comment: "Good work but could have been better."}
    ]
  },
  {
    id: 2,
    name: "Kopila Tailor",
    service: "Tailoring",
    verification: true,
    rating: 3.0,
    email: "Kopila@gmail.com",
    phone: "+977-12345678",
    location: "0.9km",
    city: "Kathmandu",
    coordinates: {lat: 27.7089, lng: 85.3206}, // Durbarmarg
    image: "https://images.unsplash.com/photo-1732850195250-940dd4d0bb49?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    about: "I provide comprehensive tailoring service for all kinds of outfits. Specializing in female outfit repair, alterations, and custom designs.",
    sustainability: "Offers sustainable packaging options and reduces waste.",
    keywords: ["tailoring", "repairs", "alterations", "custom design", "clothes"],
    languages: "Nepali, Hindi",
    rate: "Nrs 100- Nrs 500",
    reviews: [
      {id: 1, reviewer: "Nabin Rai", rating: 4.5, comment: "Wonderful tailoring service by Kopila. Highly recommended."},
      {id: 2, reviewer: "Shyam Sharma", rating: 4.0, comment: "Good work perfect fit."}
    ]
  },
  {
    id: 3,
    name: "Sita Bridal",
    service: "Bridal Makeup",
    verification: true,
    rating: 4.0,
    email: "sita@gmail.com",
    phone: "+977-12345678",
    location: "7.8km",
    city: "Lalitpur",
    coordinates: {lat: 27.6710, lng: 85.3298}, // Patan
    image: "https://images.unsplash.com/photo-1684868265714-fd2300637c23?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    about: "I provide bridal makeup services to enhance the beauty of brides on their special day.",
    sustainability: "Offers sustainable packaging options and reduces waste.",
    keywords: ["bridal makeup", "beauty enhancement", "special occasion", "eco-friendly"],
    languages: "Nepali, Hindi, English",
    rate: "Nrs 1000 - Nrs 2000 per hour",
    reviews: [
      {id: 1, reviewer: "Nabina Prashai", rating: 4.5, comment: "Great experience and wonderful work! Highly recommended."},
      {id: 2, reviewer: "Jina Shrestha", rating: 4.0, comment: "Good work but could have been better."}
    ]
  },
  {
    id: 4,
    name: "Bhaktapur Carpentry Works",
    service: "Carpentry",
    verification: true,
    rating: 4.7,
    email: "bhaktapur@gmail.com",
    phone: "+977-12345679",
    location: "12.5km",
    city: "Bhaktapur",
    coordinates: {lat: 27.6710, lng: 85.4298}, // Bhaktapur
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
    about: "Traditional and modern carpentry services with 15 years of experience.",
    sustainability: "Uses reclaimed wood and eco-friendly finishes",
    keywords: ["carpentry", "furniture", "wood", "repair", "custom"],
    languages: "Nepali, Newari",
    rate: "Nrs 800 per hour",
    reviews: [
      {id: 1, reviewer: "Prakash Joshi", rating: 5.0, comment: "Excellent craftsmanship!"},
      {id: 2, reviewer: "Ravi Kumar", rating: 4.5, comment: "Very professional service."}
    ]
  },
  {
    id: 5,
    name: "Green Plumbing Solutions",
    service: "Plumbing",
    verification: true,
    rating: 4.2,
    email: "greenplumb@gmail.com",
    phone: "+977-12345680",
    location: "2.3km",
    city: "Kathmandu",
    coordinates: {lat: 27.7000, lng: 85.3000}, // Baluwatar
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500",
    about: "Expert plumbing services with focus on water conservation and sustainable practices.",
    sustainability: "Specializes in water-saving fixtures and leak detection",
    keywords: ["plumbing", "water", "pipes", "leak", "fixtures", "conservation"],
    languages: "Nepali, English",
    rate: "Nrs 900 per hour",
    reviews: [
      {id: 1, reviewer: "Suman Thapa", rating: 4.0, comment: "Prompt and efficient service."}
    ]
  },
  {
    id: 6,
    name: "Nepal Solar Energy",
    service: "Solar Installation",
    verification: true,
    rating: 4.8,
    email: "nepalsolar@gmail.com",
    phone: "+977-12345681",
    location: "5.2km",
    city: "Kathmandu",
    coordinates: {lat: 27.7300, lng: 85.3150}, // Bouddha area
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500",
    about: "Leading solar installation company with certified technicians and quality products.",
    sustainability: "Promotes renewable energy and carbon footprint reduction",
    keywords: ["solar", "renewable", "energy", "panels", "installation", "green"],
    languages: "Nepali, Hindi, English",
    rate: "Nrs 1500 per hour",
    reviews: [
      {id: 1, reviewer: "Deepak Sharma", rating: 5.0, comment: "Outstanding service and expertise!"},
      {id: 2, reviewer: "Maya Gurung", rating: 4.5, comment: "Very satisfied with the installation."}
    ]
  },
  {
    id: 7,
    name: "Modern Beauty Studio",
    service: "Makeup & Hair",
    verification: false,
    rating: 3.8,
    email: "modernbeauty@gmail.com",
    phone: "+977-12345682",
    location: "1.5km",
    city: "Kathmandu",
    coordinates: {lat: 27.7150, lng: 85.3100}, // New Road
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
    about: "Contemporary beauty services for all occasions including bridal, party, and casual looks.",
    sustainability: "Uses cruelty-free and organic beauty products",
    keywords: ["makeup", "beauty", "hair", "bridal", "styling"],
    languages: "Nepali, English",
    rate: "Nrs 500 - Nrs 1500",
    reviews: [
      {id: 1, reviewer: "Anjana Rai", rating: 4.0, comment: "Good service and friendly staff."}
    ]
  },
  {
    id: 8,
    name: "Expert Appliance Repair",
    service: "Appliance Repair",
    verification: true,
    rating: 4.4,
    email: "expertrepair@gmail.com",
    phone: "+977-12345683",
    location: "3.8km",
    city: "Lalitpur",
    coordinates: {lat: 27.6850, lng: 85.3200}, // Jawalakhel
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
    about: "Professional repair services for all home appliances with warranty on repairs.",
    sustainability: "Promotes repair over replacement to reduce electronic waste",
    keywords: ["appliance", "repair", "electronics", "washing machine", "refrigerator"],
    languages: "Nepali, Hindi",
    rate: "Nrs 700 per hour",
    reviews: [
      {id: 1, reviewer: "Ramesh Lama", rating: 4.5, comment: "Fixed my washing machine perfectly!"}
    ]
  }
];
