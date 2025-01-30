import React from "react"
import { Search, Calendar, CreditCard, MapPin, Star, CheckCircle } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center mb-12">How VenueBook Works</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StepCard
            icon={<Search className="w-12 h-12 text-blue-600" />}
            title="1. Search for Venues"
            description="Browse our wide selection of venues. Use filters to find the perfect space for your event."
          />
          <StepCard
            icon={<Calendar className="w-12 h-12 text-blue-600" />}
            title="2. Check Availability"
            description="View the venue's calendar and select your preferred date and time slot."
          />
          <StepCard
            icon={<CreditCard className="w-12 h-12 text-blue-600" />}
            title="3. Book and Pay"
            description="Securely book your chosen venue by making a payment through our platform."
          />
          <StepCard
            icon={<MapPin className="w-12 h-12 text-blue-600" />}
            title="4. Receive Confirmation"
            description="Get instant confirmation with all the details about your booking."
          />
          <StepCard
            icon={<Star className="w-12 h-12 text-blue-600" />}
            title="5. Enjoy Your Event"
            description="Host your event at the booked venue and have a great time!"
          />
          <StepCard
            icon={<CheckCircle className="w-12 h-12 text-blue-600" />}
            title="6. Leave a Review"
            description="Share your experience by leaving a review for the venue and help others."
          />
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose VenueBook?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Wide Selection"
              description="Choose from a diverse range of venues for any type of event."
            />
            <FeatureCard
              title="Verified Venues"
              description="All venues on our platform are vetted and verified for quality."
            />
            <FeatureCard
              title="Secure Booking"
              description="Our secure payment system ensures your booking is protected."
            />
            <FeatureCard
              title="24/7 Support"
              description="Our customer support team is available round the clock to assist you."
            />
            <FeatureCard title="Best Price Guarantee" description="Find the best prices for venues, guaranteed." />
            <FeatureCard
              title="Flexible Cancellation"
              description="Many of our venues offer flexible cancellation policies."
            />
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Venue?</h2>
          <p className="text-xl text-gray-600 mb-8">Start your search now and make your event unforgettable.</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
            Explore Venues
          </button>
        </section>
      </main>
    </div>
  )
}

function StepCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

