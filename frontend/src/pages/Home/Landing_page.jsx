import { useContext, useEffect, useState } from "react";
import { CalendarDaysIcon, PartyPopperIcon, UsersIcon, ClockIcon, MapPinIcon, LightbulbIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VenueCard from "../common/VenueCard";
import { VENUES } from "../../components/Graphql/query/venuesGql";
import Loader from "../common/Loader";
import { useQuery } from "@apollo/client";
import { AuthContext } from "../../middleware/AuthContext";
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [venues, setVenues] = useState([]);
  const { data, error, loading } = useQuery(VENUES);

  useEffect(() => {
    if (data?.venues) {
      setVenues(data.venues);
    }
  }, [data]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-lime-50">
      {/* Hero Section - Left Aligned with Image */}
      <section className="bg-lime-50 py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-lime-800">Discover Unique Event Spaces</h1>
            <p className="text-xl mb-6 text-gray-700">Find the perfect venue for your wedding, corporate event, or special occasion. Explore our curated selection and make your event memorable.</p>
            <button
              className="bg-teal-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-teal-700 cursor-pointer transition-all ease-in"
              onClick={() => navigate("/venuewizard")}
            >
              Find Your Venue
            </button>
          </div>
          <div className="md:w-1/2">
            <img src="https://cdn.pixabay.com/photo/2021/01/20/21/32/prague-5935651_1280.jpg" alt="Event Planning" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Featured Services Section - Grid Layout */}
      <section className="py-16 bg-lime-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-lime-700">Explore Event Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<PartyPopperIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Catering & Beverages"
              description="Delicious menus and beverage options to delight your guests."
            />
            <ServiceCard
              icon={<MapPinIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Venue Decoration"
              description="Transform your chosen space with stunning decor and themes."
            />
            <ServiceCard
              icon={<UsersIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Entertainment & Music"
              description="Book DJs, bands, and other entertainment for a lively event."
            />
            <ServiceCard
              icon={<LightbulbIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Photography & Videography"
              description="Capture every precious moment with professional services."
            />
            <ServiceCard
              icon={<ClockIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Event Coordination"
              description="Stress-free planning with our experienced event coordinators."
            />
            <ServiceCard
              icon={<CalendarDaysIcon className="w-10 h-10 text-teal-600 mb-2" />}
              title="Equipment Rental"
              description="Chairs, tables, lighting, and all the essentials for your event."
            />
          </div>
        </div>
      </section>

      {/* Featured Venues Section - Carousel-like Layout */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-lime-700">Popular Venues</h2>
          <div className="overflow-x-auto whitespace-nowrap -mx-6 md:-mx-8">
            {venues.slice(0, 5).map((venue, index) => (
              <div key={index} className="inline-block w-80 md:w-96 mr-6 md:mr-8 shadow-md rounded-lg overflow-hidden">
                <VenueCard
                  id={venue.id}
                  name={venue.name}
                  image={venue.image?.secure_url}
                  location={venue.location}
                  basePricePerHour={venue.basePricePerHour}
                  capacity={venue.capacity}
                  services={venue.services}
                  reviews={venue.reviews}
                  isCompact={true} // Add a prop for a more compact display
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              className="px-6 py-2 border border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition-colors cursor-pointer"
              onClick={() => navigate("/Venues")}
            >
              See All Venues
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Full Width Banner */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-16 text-center">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl font-bold mb-6">Ready to Plan Your Unforgettable Event?</h2>
    <p className="text-xl mb-8">Join our community and discover the best venues and services for your needs.</p>
    <button
      className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => navigate("/SignUp")}
    >
      Get Started Today
    </button>
  </div>
</section>


      {/* Testimonials Section - Two Column Layout */}
      <section className="py-16 bg-lime-100">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-lime-700">What Our Users Are Saying</h2>
            <TestimonialCard
              quote="Venue Verse made finding the perfect wedding venue so easy! The variety of options and the ability to book services all in one place was a game-changer."
              author="Aisha Khan"
              role="Bride-to-be"
              image="https://picsum.photos/id/237/200/300"
            />
          </div>
          <div>
            <TestimonialCard
              quote="As a corporate event planner, Venue Verse has streamlined my workflow significantly. The platform is intuitive and the vendor management features are excellent."
              author="David Chen"
              role="Event Coordinator"
              image="https://picsum.photos/id/1005/200/300"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      {icon}
      <h3 className="text-xl font-semibold mt-2 mb-2 text-lime-700">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <img src={getOptimizedCloudinaryUrl(image) || "https://picsum.photos/200/300"} alt={author} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-semibold text-lime-700">{author}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 italic">"{quote}"</p>
    </div>
  );
}

function VenueCardCompact({ id, name, image, location, basePricePerHour, capacity, services, reviews }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => navigate(`/venue/${id}`)}
    >
      <img src={getOptimizedCloudinaryUrl(image) || "https://via.placeholder.com/400x300"} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-lime-700 mb-1">{name}</h3>
        <p className="text-gray-600 text-sm mb-2">{location}</p>
        <p className="text-teal-600 font-semibold text-sm">From ${basePricePerHour}/hour</p>
        <div className="flex items-center text-gray-500 text-sm mt-1">
          <UsersIcon className="w-4 h-4 mr-1" /> {capacity}
        </div>
      </div>
    </div>
  );
}