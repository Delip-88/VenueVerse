import React, { useState } from "react"
import { Star, MapPin, Users, DollarSign, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data for a single venue (replace with actual data fetching)
const venueData = {
  id: "1",
  name: "Sunset Beach Resort",
  description: "A beautiful beachfront resort with stunning ocean views and luxurious amenities.",
  location: "Malibu, CA",
  price: 500,
  capacity: 200,
  facilities: ["Wi-Fi", "Parking", "Beachfront", "Swimming Pool", "Restaurant"],
  owner: {
    id: "owner1",
    name: "John Smith",
    email: "john@example.com",
  },
  availability: [
    { date: "2025-01-26", slots: ["9:00-12:00", "13:00-16:00", "17:00-20:00"] },
    { date: "2025-01-27", slots: ["9:00-12:00", "13:00-16:00"] },
    { date: "2025-01-28", slots: ["13:00-16:00", "17:00-20:00"] },
  ],
  reviews: [
    {
      id: "r1",
      user: { name: "Alice Johnson" },
      rating: 5,
      comment: "Absolutely stunning venue! Perfect for our wedding.",
    },
    { id: "r2", user: { name: "Bob Williams" }, rating: 4, comment: "Great location and amenities. Slightly pricey." },
    {
      id: "r3",
      user: { name: "Carol Davis" },
      rating: 5,
      comment: "The staff was incredibly helpful. Highly recommend!",
    },
  ],
  image: "https://picsum.photos/200/300",
}

const VenueDetailsPage = () => {
  const [selectedDate, setSelectedDate] = useState(venueData.availability[0].date)

  const averageRating = venueData.reviews.reduce((sum, review) => sum + review.rating, 0) / venueData.reviews.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{venueData.name}</h1>

      {/* Venue Image and Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <img
          src={venueData.image || "/placeholder.svg"}
          alt={venueData.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-between">
          <div>
            <p className="flex items-center text-gray-600 mb-2">
              <MapPin className="mr-2" size={20} />
              {venueData.location}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <Users className="mr-2" size={20} />
              Capacity: {venueData.capacity}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <DollarSign className="mr-2" size={20} />${venueData.price} per day
            </p>
            <div className="flex items-center mb-2">
              <Star className="text-yellow-400 mr-1" size={20} fill="currentColor" />
              <span className="font-bold mr-2">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600">({venueData.reviews.length} reviews)</span>
            </div>
          </div>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
            Book Now
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700">{venueData.description}</p>
      </div>

      {/* Facilities */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Facilities</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {venueData.facilities.map((facility, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {facility}
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Availability</h2>
        <div className="flex items-center mb-4">
          <button onClick={() => setSelectedDate(venueData.availability[0].date)} className="mr-2">
            <ChevronLeft size={24} />
          </button>
          <Calendar className="mr-2" size={24} />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {venueData.availability.map((avail) => (
              <option key={avail.date} value={avail.date}>
                {avail.date}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedDate(venueData.availability[venueData.availability.length - 1].date)}
            className="ml-2"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {venueData.availability
            .find((avail) => avail.date === selectedDate)
            ?.slots.map((slot, index) => (
              <button key={index} className="bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded transition duration-200">
                {slot}
              </button>
            ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
        <div className="space-y-4">
          {venueData.reviews.map((review) => (
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
      </div>

      {/* Owner Information */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Venue Owner</h2>
        <p className="text-gray-700">Name: {venueData.owner.name}</p>
        <p className="text-gray-700">Contact: {venueData.owner.email}</p>
      </div>
    </div>
  )
}

export default VenueDetailsPage

