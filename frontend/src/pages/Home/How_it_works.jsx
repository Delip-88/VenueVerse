import {
  Search,
  Calendar,
  CreditCard,
  Star,
  CheckCircle,
  Users,
  Music,
  Utensils,
  Camera,
  Clock,
  Sparkles,
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Venue Verse Works</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Your all-in-one platform for planning and managing events with ease. From venue selection to service
            coordination, we've got you covered.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Plan Your Event in 6 Simple Steps</h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StepCard
            icon={<Search className="w-12 h-12 text-blue-600" />}
            title="1. Find the Perfect Venue"
            description="Browse our curated selection of venues and filter by location, capacity, price, and event type to find your ideal match."
          />
          <StepCard
            icon={<Sparkles className="w-12 h-12 text-blue-600" />}
            title="2. Select Event Services"
            description="Choose from a variety of services like catering, photography, DJ, and more to enhance your event experience."
          />
          <StepCard
            icon={<Calendar className="w-12 h-12 text-blue-600" />}
            title="3. Check Availability"
            description="View real-time availability for venues and services, then select your preferred date and time slot."
          />
          <StepCard
            icon={<CreditCard className="w-12 h-12 text-blue-600" />}
            title="4. Book and Pay Securely"
            description="Complete your booking with our secure payment system. Manage all your vendors in one transaction."
          />
          <StepCard
            icon={<Clock className="w-12 h-12 text-blue-600" />}
            title="5. Coordinate Your Event"
            description="Use our platform to communicate with venue owners and service providers to ensure everything runs smoothly."
          />
          <StepCard
            icon={<CheckCircle className="w-12 h-12 text-blue-600" />}
            title="6. Enjoy and Review"
            description="Host your perfect event and share your experience by leaving reviews for venues and services."
          />
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Event Services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              icon={<Utensils className="w-10 h-10 text-blue-600" />}
              title="Catering"
              description="Professional food services for any event size and cuisine preference."
            />
            <ServiceCard
              icon={<Music className="w-10 h-10 text-blue-600" />}
              title="DJ & Entertainment"
              description="Top-rated DJs and entertainment options to keep your guests engaged."
            />
            <ServiceCard
              icon={<Camera className="w-10 h-10 text-blue-600" />}
              title="Photography"
              description="Capture your special moments with our professional photographers."
            />
            <ServiceCard
              icon={<Users className="w-10 h-10 text-blue-600" />}
              title="Event Staff"
              description="Experienced staff to ensure your event runs smoothly from start to finish."
            />
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Venue Verse?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="All-in-One Platform"
              description="Manage venues, services, and vendors in one place, simplifying your event planning process."
            />
            <FeatureCard
              title="Verified Providers"
              description="All venues and service providers are thoroughly vetted to ensure quality and reliability."
            />
            <FeatureCard
              title="Transparent Pricing"
              description="Clear pricing with no hidden fees. See exactly what you're paying for each service."
            />
            <FeatureCard
              title="Real-Time Coordination"
              description="Communicate with all your vendors through our platform to keep everyone on the same page."
            />
            <FeatureCard
              title="Customizable Packages"
              description="Mix and match services to create the perfect event package tailored to your needs."
            />
            <FeatureCard
              title="Dedicated Support"
              description="Our event specialists are available to help you with any questions or issues that arise."
            />
          </div>
        </section>

        <section className="mt-20 bg-blue-50 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Event?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start planning today and transform your vision into an unforgettable experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
                Explore Venues
              </button>
              <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition duration-300">
                Browse Services
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="Venue Verse made planning our corporate conference so much easier. We found the perfect venue and coordinated all our vendors in one place!"
              author="Priya Sharma"
              role="Event Manager"
              rating={5}
            />
            <TestimonialCard
              quote="The ability to book both our wedding venue and catering service together saved us so much time. Highly recommend for any couple planning their big day."
              author="Rahul and Meera"
              role="Newlyweds"
              rating={5}
            />
            <TestimonialCard
              quote="As someone who organizes events frequently, I appreciate how Venue Verse streamlines the entire process. Their customer support is also exceptional."
              author="Vikram Mehta"
              role="Corporate Planner"
              rating={4}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StepCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4 p-3 bg-blue-50 rounded-full">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-50 rounded-full mr-3">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, rating }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  )
}

