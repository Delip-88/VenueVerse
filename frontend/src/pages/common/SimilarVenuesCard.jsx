// Description: This component displays a card for a similar venue with its image, name, location, price, capacity, and rating.
import { Star, MapPin, Users, IndianRupee } from "lucide-react"
import { useNavigate } from "react-router-dom"
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl"


const SimilarVenueCard = ({ venue }) => {
  const navigate = useNavigate()

  // Calculate average rating
  const averageRating =
    venue.reviews && venue.reviews.length > 0
      ? (venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
      : null

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/venue/${venue.id}`)}
    >
      {/* Venue Image */}
      <div className="h-32 overflow-hidden">
        <img
          src={getOptimizedCloudinaryUrl(venue.image?.secure_url) || "/placeholder.svg"}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Venue Details */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">{venue.name}</h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-xs mb-1">
          <MapPin size={12} className="mr-1 text-teal-500" />
          <span className="truncate">
            {venue.location?.city}, {venue.location?.province}
          </span>
        </div>

        {/* Price and Capacity */}
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <div className="flex items-center">
            <IndianRupee size={12} className="mr-1 text-teal-500" />
            <span>Rs. {venue.basePricePerHour}/hr</span>
          </div>
          <div className="flex items-center">
            <Users size={12} className="mr-1 text-teal-500" />
            <span>{venue.capacity}</span>
          </div>
        </div>

        {/* Rating */}
        {averageRating && (
          <div className="flex items-center mt-1">
            <Star size={12} className="text-yellow-400 mr-1" fill="currentColor" />
            <span className="text-xs font-medium">{averageRating}</span>
            <span className="text-xs text-gray-500 ml-1">({venue.reviews.length})</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimilarVenueCard
