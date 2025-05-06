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
  Lightbulb,
  MapPin,
  ThumbsUp,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-lime-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Unlock Seamless Event Planning</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover how Venue Verse simplifies every step of your event journey, from finding the perfect space to coordinating all the details.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-lime-700">Your Event, Simplified in 4 Steps</h2>

        <div className="grid gap-8 md:grid-cols-2">
          <StepCard
            icon={<Search className="w-12 h-12 text-teal-600" />}
            title="1. Explore & Discover Venues"
            description="Dive into our extensive collection of venues. Filter by location, capacity, and amenities to pinpoint the perfect setting for your event."
          />
          <StepCard
            icon={<Lightbulb className="w-12 h-12 text-teal-600" />}
            title="2. Customize with Services"
            description="Enhance your event with our wide array of services, including catering, entertainment, and decorations, all in one place."
          />
          <StepCard
            icon={<Calendar className="w-12 h-12 text-teal-600" />}
            title="3. Book with Confidence"
            description="Check real-time availability and secure your venue and services with our straightforward booking process."
          />
          <StepCard
            icon={<CheckCircle className="w-12 h-12 text-teal-600" />}
            title="4. Manage & Celebrate"
            description="Coordinate effortlessly with vendors and enjoy your perfectly planned event. Share your experience with our community."
          />
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-lime-700">Explore Our Key Services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<Utensils className="w-10 h-10 text-teal-600" />}
              title="Culinary Delights"
              description="Savor exquisite catering options tailored to your event's theme and your guests' preferences."
            />
            <ServiceCard
              icon={<Music className="w-10 h-10 text-teal-600" />}
              title="Vibrant Entertainment"
              description="From live bands to dynamic DJs, find the perfect entertainment to set the mood."
            />
            <ServiceCard
              icon={<Camera className="w-10 h-10 text-teal-600" />}
              title="Memorable Photography"
              description="Capture every smile and moment with our professional photography and videography services."
            />
            <ServiceCard
              icon={<Users className="w-10 h-10 text-teal-600" />}
              title="Dedicated Event Staff"
              description="Our experienced event staff are here to ensure everything runs seamlessly."
            />
            <ServiceCard
              icon={<Sparkles className="w-10 h-10 text-teal-600" />}
              title="Stunning Decorations"
              description="Transform your venue with breathtaking decor options to match your vision."
            />
            <ServiceCard
              icon={<Clock className="w-10 h-10 text-teal-600" />}
              title="Efficient Coordination"
              description="Let our expert coordinators handle the logistics, so you can focus on enjoying your event."
            />
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-lime-700">Why Choose Venue Verse?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ThumbsUp className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Curated Selection"
              description="Discover only the finest, verified venues and service providers."
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Localized Options"
              description="Find venues and services specific to your location for convenience."
            />
            <FeatureCard
              icon={<CreditCard className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Secure Transactions"
              description="Enjoy peace of mind with our secure booking and payment system."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Vendor Collaboration"
              description="Effortlessly communicate and coordinate with all your chosen vendors."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Time-Saving Platform"
              description="Streamline your planning process and save valuable time and effort."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-teal-600 mb-2 mx-auto" />}
              title="Quality Assurance"
              description="Benefit from transparent reviews and ratings to make informed decisions."
            />
          </div>
        </section>

        <section className="mt-20 bg-lime-100 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-lime-700">Ready to Simplify Your Event Planning?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Start your journey with Venue Verse today and experience a stress-free way to plan and manage your events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-teal-600 text-white rounded-lg text-lg font-semibold hover:bg-teal-700 transition duration-300">
                Explore Venues
              </button>
              <button className="px-8 py-3 border border-teal-600 text-teal-600 rounded-lg text-lg font-semibold hover:bg-teal-50 transition duration-300">
                Browse Services
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-lime-700">Hear From Our Happy Planners</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="Venue Verse revolutionized how we plan our corporate events. Finding and booking everything in one place has been incredibly efficient."
              author="Anya Sharma"
              role="Corporate Events Coordinator"
              rating={5}
              color="yellow-400"
            />
            <TestimonialCard
              quote="Planning our wedding seemed daunting until we found Venue Verse. The variety of venues and the integrated service booking made it a breeze!"
              author="Raj & Priya Verma"
              role="Soon-to-be-Wed"
              rating={5}
              color="yellow-400"
            />
            <TestimonialCard
              quote="I love how easy it is to coordinate with different vendors through Venue Verse. It keeps everything organized and on track."
              author="Samir Gupta"
              role="Event Organizer"
              rating={4}
              color="yellow-400"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StepCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4 p-3 bg-teal-50 rounded-full">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-lime-700">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-teal-50 rounded-full mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-lime-700">{title}</h3>
      </div>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      {icon}
      <h3 className="text-lg font-semibold mt-2 mb-2 text-lime-700">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex mb-4 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < rating ? `text-${color} fill-${color}` : "text-gray-300"}`} />
        ))}
      </div>
      <p className="text-gray-700 italic mb-4 text-center">"{quote}"</p>
      <div className="text-center">
        <p className="font-semibold text-lime-700">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  );
}