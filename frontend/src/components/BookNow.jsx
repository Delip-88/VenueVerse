"use client"

import { useState, useEffect, useContext } from "react"
import { Calendar, Clock, MapPin, Users, DollarSign, AlertCircle } from "lucide-react"
import { useParams } from "react-router-dom"
import { VENUE_BY_ID } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../middleware/AuthContext"

const BookNowPage = () => {
  const { venueId } = useParams() || {}
  const { user } = useContext(AuthContext)

  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id: venueId },
  })

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    startTime: "",
    endTime: "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0]
    const dateInput = document.getElementById("date")
    if (dateInput) {
      dateInput.min = today
    }
  }, [])

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>

  const venue = data.venue

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }))

    // Clear errors when input changes
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }))

    // Validate date
    if (name === "date") {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          date: "Please select a future date",
        }))
      }
    }

    // Validate time
    if (name === "startTime" || name === "endTime") {
      const { startTime, endTime } = {
        ...bookingDetails,
        [name]: value,
      }

      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`)
        const end = new Date(`2000-01-01T${endTime}`)
        const diffInHours = (end - start) / (1000 * 60 * 60)

        if (diffInHours < 1) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            time: "The duration must be at least 1 hour",
          }))
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            time: "",
          }))
        }
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.values(errors).some((error) => error !== "")) {
      console.log("Form has errors. Please correct them before submitting.")
      return
    }
    console.log("Booking submitted:", bookingDetails)
    // Handle form submission (e.g., send to API, show confirmation)
  }

  // Generate time options from 00:00 to 23:30 in 30-minute intervals
  const generateTimeOptions = () => {
    const options = []
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i.toString().padStart(2, "0")
        const minute = j.toString().padStart(2, "0")
        options.push(`${hour}:${minute}`)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Book Now</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Venue Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{venue.name}</h2>
          <img
            src={venue.image.secure_url || "/placeholder.svg"}
            alt={venue.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <div className="space-y-2">
            <p className="flex items-center text-gray-600 mb-2">
              <MapPin className="mr-2" size={18} /> {venue.location.street}, {venue.location.city}, {venue.location.province}
            </p>
            <p className="flex items-center">
              <Users className="mr-2" size={18} /> Capacity: {venue.capacity}
            </p>
            <p className="flex items-center">
              <DollarSign className="mr-2" size={18} /> ${venue.pricePerHour}/hour
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="flex items-center">
                <Calendar size={20} className="text-gray-400 mr-2" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={bookingDetails.date}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? "border-red-500" : ""
                  }`}
                  required
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-2" />
                  <select
                    id="startTime"
                    name="startTime"
                    value={bookingDetails.startTime}
                    onChange={handleInputChange}
                    className={`border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 ${
                      errors.time ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select time</option>
                    {timeOptions.map((time) => (
                      <option key={`start-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-2" />
                  <select
                    id="endTime"
                    name="endTime"
                    value={bookingDetails.endTime}
                    onChange={handleInputChange}
                    className={`border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 ${
                      errors.time ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select time</option>
                    {timeOptions.map((time) => (
                      <option key={`end-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {errors.time && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.time}
              </p>
            )}

            {/* Customer Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={bookingDetails.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={bookingDetails.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={bookingDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookNowPage

