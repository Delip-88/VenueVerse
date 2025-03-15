
import { useContext, useEffect, useState } from "react"
import { CalendarDaysIcon, PartyPopperIcon, UsersIcon, ClockIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import VenueCard from "../common/VenueCard"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import Loader from "../common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../../middleware/AuthContext"

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)
  const [venues, setVenues] = useState([]) // Initialize as an empty array
  const { data, error, loading } = useQuery(VENUES)

  useEffect(() => {
    if (data?.venues) {
      setVenues(data.venues)
    }
  }, [data])

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-gray-100 pt-10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Plan Your Perfect Event</h1>
          <p className="text-xl mb-8">From venues to services, manage every aspect of your event in one place.</p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 cursor-pointer transition-all ease-in"
            onClick={() => navigate("/venuewizard")}
          >
            Start Planning
          </button>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-10">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Venues & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.slice(0, 3).map((venue, index) => (
              <VenueCard
                key={index}
                id={venue.id}
                name={venue.name}
                image={venue.image?.secure_url}
                location={venue.location}
                basePricePerHour={venue.basePricePerHour}
                capacity={venue.capacity}
                services={venue.services}
                reviews={venue.reviews}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => navigate("/Venues")}
            >
              View All Venues
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Venue Verse for Your Events?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CalendarDaysIcon className="w-12 h-12 text-blue-600" />}
              title="All-in-One Planning"
              description="Book venues and services in one seamless experience."
            />
            <FeatureCard
              icon={<PartyPopperIcon className="w-12 h-12 text-blue-600" />}
              title="Diverse Event Services"
              description="From catering to photography, find all the services you need."
            />
            <FeatureCard
              icon={<UsersIcon className="w-12 h-12 text-blue-600" />}
              title="Vendor Management"
              description="Easily coordinate with all your event service providers."
            />
            <FeatureCard
              icon={<ClockIcon className="w-12 h-12 text-blue-600" />}
              title="Real-time Updates"
              description="Stay informed with instant notifications about your event."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
            <StepCard number={1} title="Plan" description="Select your venue and add event services you need." />
            <StepCard number={2} title="Book" description="Secure your venue and services with easy booking." />
            <StepCard number={3} title="Manage" description="Coordinate all aspects of your event in one dashboard." />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Event Planners Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Venue Verse simplified our corporate conference planning. Having all services in one place saved us countless hours!"
              author="Priya Sharma"
              role="Corporate Event Manager"
              image="https://picsum.photos/200/300"
            />
            <TestimonialCard
              quote="From venue selection to catering and photography, I planned my entire wedding through this platform. Absolutely seamless!"
              author="Rahul Patel"
              role="Wedding Planner"
              image="https://picsum.photos/200/300"
            />
            <TestimonialCard
              quote="The ability to coordinate multiple vendors through one platform made organizing our annual charity gala so much easier."
              author="Ananya Gupta"
              role="Non-profit Event Coordinator"
              image="https://picsum.photos/200/300"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Event?</h2>
          <p className="text-xl mb-8">Join thousands of event planners and make your next event unforgettable!</p>
          <button
            className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100"
            onClick={() => navigate("/SignUp")}
          >
            Start Planning Now
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

