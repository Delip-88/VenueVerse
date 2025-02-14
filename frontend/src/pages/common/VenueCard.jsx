"use client"

import { useContext, useState } from "react"
import { StarIcon, Users, Clock, MapPin, Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"

function VenueCard({ id, name, image, location, pricePerHour, capacity, facilities, reviews }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()
  const {isAuthenticated} = useContext(AuthContext)
  // Extract city and street from location
  const locationText = location ? `${location.street}, ${location.city}` : "Location not available"

  // Compute average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "No reviews"

  const handleFavoriteClick = (e) => {
    e.stopPropagation() // Prevent the card click event from firing
    setIsFavorite(!isFavorite)
    // Here you would typically make an API call to update the user's favorites
    console.log(`Venue ${id} ${isFavorite ? "removed from" : "added to"} favorites`)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
      onClick={() => navigate(`/venue/${id}`)}
    >
      <img src={image || "/placeholder.svg"} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
      {isAuthenticated ? (<button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 bg-black rounded-full shadow-md cursor-pointer transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? "text-red-600 fill-red-500" : "text-gray-400"}`} />
      </button>) : ""}
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <p>{locationText}</p>
        </div>

        {/* Pricing and Rating */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-blue-500 font-medium">
            <Clock className="w-4 h-4 mr-1" />
            Rs. {pricePerHour}/hour
          </div>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>{averageRating}</span>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-gray-600 mt-2">
          <Users className="w-4 h-4 mr-1" />
          <p>Capacity: {capacity || "N/A"} guests</p>
        </div>

        {/* Facilities */}
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

