import React from "react"
import { CalendarDaysIcon, MapPinIcon, StarIcon, CurrencyIcon as CurrencyDollarIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero Section */}
      <section className="bg-gray-100  py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Perfect Venue</h1>
          <p className="text-xl mb-8">Book unique spaces for any event, anywhere.</p>
          <button className="bg-gray-200 text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 cursor-pointer transition-all ease-in">
            Get Started
          </button>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <VenueCard
              name="Elegant Ballroom"
              image="https://picsum.photos/200/300"
              location="Downtown"
              price={1000}
              rating={4.8}
            />
            <VenueCard
              name="Rustic Barn"
              image="https://picsum.photos/200/300"
              location="Countryside"
              price={800}
              rating={4.6}
            />
            <VenueCard
              name="Modern Conference Center"
              image="https://picsum.photos/200/300"
              location="Business District"
              price={1200}
              rating={4.9}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VenueBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CalendarDaysIcon className="w-12 h-12 text-blue-600" />}
              title="Easy Booking"
              description="Simple and quick process to book your desired venue."
            />
            <FeatureCard
              icon={<MapPinIcon className="w-12 h-12 text-blue-600" />}
              title="Wide Selection"
              description="Choose from a variety of venues across different locations."
            />
            <FeatureCard
              icon={<StarIcon className="w-12 h-12 text-blue-600" />}
              title="Verified Reviews"
              description="Read authentic reviews from previous customers."
            />
            <FeatureCard
              icon={<CurrencyDollarIcon className="w-12 h-12 text-blue-600" />}
              title="Best Prices"
              description="Competitive pricing for all types of venues."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
            <StepCard number={1} title="Search" description="Find the perfect venue for your event." />
            <StepCard number={2} title="Book" description="Reserve your chosen venue and time slot." />
            <StepCard number={3} title="Enjoy" description="Host your event at your booked venue." />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="VenueBook made finding and booking a venue for our corporate event so easy!"
              author="Jane Doe"
              role="Event Planner"
              image="https://picsum.photos/200/300"
            />
            <TestimonialCard
              quote="Great selection of venues and excellent customer service. Highly recommended!"
              author="John Smith"
              role="Wedding Coordinator"
              image="https://picsum.photos/200/300"
            />
            <TestimonialCard
              quote="I love how simple it is to book a venue through this platform. Will use again!"
              author="Alice Johnson"
              role="Birthday Party Host"
              image="https://picsum.photos/200/300"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Venue?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers and book your venue today!</p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100" onClick={()=> navigate("/SignUp")}>
            Sign Up Now
          </button>
        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon}
      <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <img src={image || "https://picsum.photos/200/300"} alt={author} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
    </div>
  )
}

function VenueCard({ name, image, location, price, rating }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer ">
      <img src={image || "/placeholder.svg"} alt={name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{location}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">${price}/day</p>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

