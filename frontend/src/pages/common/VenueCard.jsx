import { useContext, useState } from "react"
import { Heart, Star, Users, Clock, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"

function VenueCard({ id, name, image, location, pricePerHour, capacity, facilities, reviews }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)

  const locationText = location ? `${location.street}, ${location.city}` : "Location not available"

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "No reviews"

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log(`Venue ${id} ${isFavorite ? "removed from" : "added to"} favorites`)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group"
      onClick={() => navigate(`/venue/${id}`)}
    >
      <img src={image || "/placeholder.svg"} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
      {isAuthenticated && user && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full shadow-md cursor-pointer transition-all opacity-0 group-hover:opacity-100"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "text-red-600 fill-red-500" : "text-white"}`} />
        </button>
      )}

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <p>{locationText}</p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-blue-500 font-medium">
            <Clock className="w-4 h-4 mr-1" />
            Rs. {pricePerHour}/hour
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-1" />
            <span>{averageRating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mt-2">
          <Users className="w-4 h-4 mr-1" />
          <p>Capacity: {capacity || "N/A"} guests</p>
        </div>

        {facilities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {facilities.map((facility, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {facility}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VenueCard

