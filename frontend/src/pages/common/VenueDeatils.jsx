import { Star, MapPin, Users, DollarSign, Clock, Phone, Mail } from "lucide-react"
import { useQuery } from "@apollo/client"
import { VENUE_BY_ID } from "../../components/Graphql/query/venuesGql"
import Loader from "./Loader"
import { useNavigate, useParams } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../middleware/AuthContext"

const VenueDetailsPage = () => {
  const { id } = useParams()

  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
  })

  const {isAuthenticated} = useContext(AuthContext)
  const navigate = useNavigate()

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>

  const venue = data.venue

  const averageRating =
    venue.reviews.length > 0
      ? (venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
      : "No ratings"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{venue.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <img
          src={venue.image?.secure_url || "/placeholder.svg"}
          alt={venue.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-between">
          <div>
            <p className="flex items-center text-gray-600 mb-2">
              <MapPin className="mr-2" size={20} />
              {venue.location.street}, {venue.location.city}, {venue.location.province}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <Users className="mr-2" size={20} />
              Capacity: {venue.capacity}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <Clock className="mr-2" size={20} />
              <DollarSign className="mr-1" size={16} />
              {venue.pricePerHour} per hour
            </p>
            <div className="flex items-center mb-2">
              <Star className="text-yellow-400 mr-1" size={20} fill="currentColor" />
              <span className="font-bold mr-2">{averageRating}</span>
              <span className="text-gray-600">({venue.reviews.length} reviews)</span>
            </div>
          </div>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200" onClick={() => navigate(isAuthenticated ? `/Home/venue/${id}/book-now` : "/login")}>
            Book Now
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700">{venue.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Facilities</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {venue.facilities.map((facility, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {facility}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
        {venue.reviews.length === 0 ? (
          <p className="text-gray-700">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {venue.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-2">{review.user.name}</span>
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
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Venue Owner</h2>
        <p className="flex items-center text-gray-700 mb-2">
          <Users className="mr-2" size={20} />
          {venue.owner.name}
        </p>
        <p className="flex items-center text-gray-700 mb-2">
          <Mail className="mr-2" size={20} />
          {venue.owner.email}
        </p>
        {venue.owner.phone && (
          <p className="flex items-center text-gray-700">
            <Phone className="mr-2" size={20} />
            {venue.owner.phone}
          </p>
        )}
      </div>
    </div>
  )
}

export default VenueDetailsPage

