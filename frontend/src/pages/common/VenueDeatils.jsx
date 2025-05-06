
import {
  Star,
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  IndianRupee,
  Music,
  Utensils,
  Camera,
  Sparkles,
  Home,
} from "lucide-react"
import { useQuery } from "@apollo/client"
import { VENUE_BY_ID } from "../../components/Graphql/query/venuesGql"
import Loader from "./Loader"
import { useNavigate, useParams } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../middleware/AuthContext"
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl"
import SimilarVenues from "./SimilarVenue"

const VenueDetailsPage = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
  })
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>

  const venue = data.venue
  const averageRating =
    venue.reviews.length > 0
      ? (venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
      : "No ratings"

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes("dj") || name.includes("music")) return <Music className="mr-2 text-teal-500" size={20} />
    if (name.includes("catering") || name.includes("food")) return <Utensils className="mr-2 text-teal-500" size={20} />
    if (name.includes("photo") || name.includes("video")) return <Camera className="mr-2 text-teal-500" size={20} />
    return <Sparkles className="mr-2 text-teal-500" size={20} />
  }

  // Format category name for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleNavigate = (id) => {
    localStorage.setItem("searchedVenueId", id)
    navigate(isAuthenticated ? `/Home/venue/${id}/book-now` : "/login")
  }

  return (
    <div className="bg-lime-50 min-h-screen py-8">
      {" "}
      {/* Light lime background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Name, Back Button, Image */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lime-700 mb-2">{venue.name}</h1> {/* Darker lime title */}
            <div className="flex items-center text-gray-600">
              <Star className="text-yellow-400 mr-1" size={16} fill="currentColor" />
              <span className="font-semibold mr-1">{averageRating}</span>
              <span className="text-sm">({venue.reviews.length} reviews)</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/Home")}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-teal-500 hover:text-white cursor-pointer py-2 px-4 rounded-md transition duration-200 mt-4 md:mt-0" /* Teal hover */
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
        </div>

        {/* Main Content Grid - Added grid layout for main content and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src={getOptimizedCloudinaryUrl(venue.image?.secure_url) || "/placeholder.svg"}
                alt={venue.name}
                className="w-full h-auto object-cover"
                style={{ maxHeight: "400px" }}
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-teal-600 mb-2 flex items-center">
                  <MapPin className="mr-2" size={20} /> Location
                </h3>{" "}
                {/* Teal heading */}
                <p className="text-gray-700">
                  {venue.location.street}, {venue.location.city}, {venue.location.province}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-teal-600 mb-2 flex items-center">
                  <Users className="mr-2" size={20} /> Capacity
                </h3>{" "}
                {/* Teal heading */}
                <p className="text-gray-700">{venue.capacity} guests</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-teal-600 mb-2 flex items-center">
                  <Clock className="mr-2" size={20} /> Price
                </h3>{" "}
                {/* Teal heading */}
                <p className="text-gray-700">
                  <IndianRupee className="mr-1" size={16} /> {venue.basePricePerHour} per hour
                </p>
              </div>
            </div>

            {/* Book Now Button after Key Details */}
            <div className="text-center">
              <button
                className="bg-teal-500 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-teal-600 transition duration-200" /* Teal book now button */
                onClick={() => handleNavigate(venue.id)}
              >
                Book This Venue
              </button>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-teal-600 mb-3">Description</h2> {/* Teal heading */}
              <p className="text-gray-700 leading-relaxed">{venue.description}</p>
            </div>

            {/* Event Types */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-teal-600 mb-3">Event Types</h2> {/* Teal heading */}
              {venue.categories && venue.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                      {" "}
                      {/* Teal tags */}
                      {formatCategory(category)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700">No specific event types listed</p>
              )}
            </div>

            {/* Available Services */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-teal-600 mb-3">Available Services</h2> {/* Teal heading */}
              {venue.services && venue.services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.services.map((service, index) => (
                    <div
                      key={index}
                      className="bg-lime-50 p-4 rounded-lg shadow-inner border border-lime-200 flex items-center"
                    >
                      {" "}
                      {/* Light lime service cards */}
                      <div className="mr-3 flex-shrink-0">
                        {service.serviceId.image?.secure_url ? (
                          <img
                            src={getOptimizedCloudinaryUrl(service.serviceId.image.secure_url) || "/placeholder.svg"}
                            alt={service.serviceId.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-lime-100 rounded-md flex items-center justify-center text-teal-600">
                            {" "}
                            {/* Light lime service icon background */}
                            {getServiceIcon(service.serviceId.name)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{service.serviceId.name}</h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <IndianRupee className="mr-1 text-teal-500" size={14} /> Rs. {service.servicePrice}{" "}
                          {/* Teal rupee icon */}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700">No additional services available</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-teal-600 mb-3">Reviews</h2> {/* Teal heading */}
              {venue.reviews.length === 0 ? (
                <p className="text-gray-700">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {venue.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-gray-800 mr-2">{review?.user?.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Takes up 1/3 of the space on large screens */}
          <div className="space-y-6">
            {/* Similar Venues Section - NEW */}
            <SimilarVenues currentVenue={venue} />

            {/* Venue Owner */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-teal-600 mb-3">Venue Owner</h2> {/* Teal heading */}
              <p className="flex items-center text-gray-700 mb-2">
                <Users className="mr-2 text-teal-500" size={20} /> {venue.owner.name}
              </p>{" "}
              {/* Teal user icon */}
              <p className="flex items-center text-gray-700 mb-2">
                <Mail className="mr-2 text-teal-500" size={20} /> {venue.owner.email}
              </p>{" "}
              {/* Teal mail icon */}
              {venue.owner.phone && (
                <p className="flex items-center text-gray-700">
                  <Phone className="mr-2 text-teal-500" size={20} /> {venue.owner.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueDetailsPage
