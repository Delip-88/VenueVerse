"use client"

import { useState, useEffect, useContext, useMemo } from "react"
import {
  Clock,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  Check,
  Package,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { VENUE_BY_ID } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../middleware/AuthContext"
import EsewaPaymentForm from "./EsewaPaymentForm"
import { calculateTotalPrice } from "./Functions/calc"

// Calendar component for date selection with availability indicators
const DatePicker = ({ availableDates, selectedDate, onDateChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get days in month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  // Format date as YYYY-MM-DD for comparison
  const formatDateString = (date) => {
    return date.toISOString().split("T")[0]
  }

  // Check if a date is available
  const isDateAvailable = (date) => {
    const dateString = formatDateString(date)
    return availableDates.includes(dateString)
  }

  // Check if a date is in the past
  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Check if a date is selected
  const isDateSelected = (date) => {
    return selectedDate === formatDateString(date)
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Get month name and year
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  // Days of week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDateString(date)
    const isPast = isDateInPast(date)
    const isAvailable = isDateAvailable(date)
    const isSelected = isDateSelected(date)

    calendarDays.push(
      <button
        key={dateString}
        onClick={() => !isPast && isAvailable && onDateChange(dateString)}
        disabled={isPast || !isAvailable}
        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
          ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
          ${isSelected ? "bg-blue-600 text-white" : ""}
          ${!isPast && isAvailable && !isSelected ? "hover:bg-blue-100" : ""}
          ${!isPast && !isAvailable ? "text-gray-400 cursor-not-allowed" : ""}
        `}
      >
        {day}
      </button>,
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-medium">
          {monthName} {year}
        </h3>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}

// Add a helper function to convert time string to minutes for easier comparison
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

// Helper function to format time for display (e.g., 09:00 AM/PM)
const formatTimeForDisplay = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  const period = hours < 12 ? "AM" : "PM"
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12 // Convert 0 and 12 to 12
  return `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Time slot selector component
const TimeSlotSelector = ({
  availableTimeSlots,
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  bookings = [],
  bookingDetails,
}) => {
  // Convert selected start time to minutes
  const startTimeMinutes = selectedStartTime ? timeToMinutes(selectedStartTime) : 0

  // Filter end time options based on selected start time
  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return []

    const startTimeIndex = availableTimeSlots.findIndex((slot) => slot === selectedStartTime)
    if (startTimeIndex === -1) return []

    // Get the current date's bookings
    const dateBookings = bookings.filter((booking) => booking.date === bookingDetails.date)

    // Only show end times that are after the selected start time
    // AND don't overlap with any existing bookings
    return availableTimeSlots.filter((timeSlot, index) => {
      // Must be after start time
      if (index <= startTimeIndex) return false

      const endTimeMinutes = timeToMinutes(timeSlot)

      // Check if this potential end time would overlap with any booking
      for (const booking of dateBookings) {
        for (const slot of booking.timeslots) {
          const bookingStartMinutes = timeToMinutes(slot.start)
          const bookingEndMinutes = timeToMinutes(slot.end)

          // If our start time is before booking start, and this end time is after booking start,
          // then it would overlap
          if (startTimeMinutes < bookingStartMinutes && endTimeMinutes > bookingStartMinutes) {
            return false
          }

          // If our start time is within a booking, this is already invalid
          if (startTimeMinutes >= bookingStartMinutes && startTimeMinutes < bookingEndMinutes) {
            return false
          }
        }
      }

      return true
    })
  }, [availableTimeSlots, selectedStartTime, bookingDetails.date, bookings])

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
          Start Time
        </label>
        <div className="relative">
          <select
            id="startTime"
            value={selectedStartTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="appearance-none pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={availableTimeSlots.length === 0}
          >
            <option value="">Select start time</option>
            {availableTimeSlots.map((time) => (
              <option key={`start-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
          End Time
        </label>
        <div className="relative">
          <select
            id="endTime"
            value={selectedEndTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="appearance-none pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedStartTime || availableEndTimes.length === 0}
          >
            <option value="">Select end time</option>
            {availableEndTimes.map((time) => (
              <option key={`end-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Add information about the 1-hour gap policy */}
      <div className="text-xs text-gray-500 italic">
        Note: A 1-hour gap is automatically reserved between bookings for venue preparation and cleanup.
      </div>
    </div>
  )
}

// Helper function to generate time slots for a day (24-hour format)
const generateTimeSlots = () => {
  const slots = []
  // Generate slots from 00:00 to 23:00 in hourly increments
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
  }
  return slots
}

// Helper function to check if a time is within a booking's time range (including 1-hour buffer)
const isTimeConflicting = (time, bookings, date) => {
  // Convert time string to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const timeInMinutes = timeToMinutes(time)

  // Check each booking for the selected date
  for (const booking of bookings) {
    if (booking.date === date) {
      for (const timeslot of booking.timeslots) {
        // Convert booking times to minutes
        const startInMinutes = timeToMinutes(timeslot.start)
        const endInMinutes = timeToMinutes(timeslot.end)

        // Add 1-hour buffer (60 minutes) before and after booking
        const bufferStartInMinutes = Math.max(0, startInMinutes - 60)
        const bufferEndInMinutes = Math.min(24 * 60 - 1, endInMinutes + 60)

        // Check if time falls within the booking time range (including buffer)
        if (timeInMinutes >= bufferStartInMinutes && timeInMinutes < bufferEndInMinutes) {
          return true // Time conflicts with a booking
        }
      }
    }
  }

  return false // No conflict found
}

// Calculate duration in hours between start and end time
const calculateDuration = (start, end) => {
  if (!start || !end) return 0
  const startTime = new Date(`2000-01-01T${start}`)
  const endTime = new Date(`2000-01-01T${end}`)
  return (endTime - startTime) / (1000 * 60 * 60)
}

const BookNowPage = () => {
  const { venueId } = useParams() || {}
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      window.location.href = "/login"
    }
  }, [])

  // Fetch venue details (which now includes bookings)
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
    selectedServices: [],
  })

  const [errors, setErrors] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)

  // Process venue data to get available dates and time slots
  const { availableDates, availableTimeSlotsByDate } = useMemo(() => {
    if (!data?.venue) {
      return { availableDates: [], availableTimeSlotsByDate: {} }
    }

    const venue = data.venue
    const bookings = venue.bookings || []
    const allTimeSlots = generateTimeSlots()
    const availableTimeSlotsByDate = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Generate dates for the next 90 days
    const dates = []
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    // Calculate available time slots for each date
    for (const date of dates) {
      const availableSlotsForDate = allTimeSlots.filter((time) => !isTimeConflicting(time, bookings, date))

      // Only include dates that have at least one available time slot
      if (availableSlotsForDate.length > 0) {
        availableTimeSlotsByDate[date] = availableSlotsForDate
      }
    }

    return {
      availableDates: Object.keys(availableTimeSlotsByDate),
      availableTimeSlotsByDate,
    }
  }, [data?.venue])

  // Get available time slots for the selected date
  const availableTimeSlotsForSelectedDate = useMemo(() => {
    if (!bookingDetails.date || !availableTimeSlotsByDate[bookingDetails.date]) {
      return []
    }
    return availableTimeSlotsByDate[bookingDetails.date]
  }, [bookingDetails.date, availableTimeSlotsByDate])

  useEffect(() => {
    // Calculate total price whenever booking details change
    if (data?.venue && bookingDetails.startTime && bookingDetails.endTime) {
      // Calculate venue rental price based on hours
      const duration = calculateDuration(bookingDetails.startTime, bookingDetails.endTime)
      const basePrice = calculateTotalPrice(
        bookingDetails.startTime,
        bookingDetails.endTime,
        data.venue.basePricePerHour,
      )

      // Add service prices based on their category (fixed or hourly)
      const servicePrice = bookingDetails.selectedServices.reduce((total, serviceId) => {
        const service = data.venue.services.find((s) => s.serviceId.id === serviceId)
        if (service) {
          // Check if the service is hourly or fixed
          if (service.category === "hourly") {
            // For hourly services, multiply by duration
            return total + service.servicePrice * duration
          } else {
            // For fixed services, use the price as is
            return total + service.servicePrice
          }
        }
        return total
      }, 0)

      setTotalPrice(basePrice + servicePrice)
    }
  }, [bookingDetails.startTime, bookingDetails.endTime, bookingDetails.selectedServices, data?.venue])

  // Reset time selections when date changes
  useEffect(() => {
    setBookingDetails((prev) => ({
      ...prev,
      startTime: "",
      endTime: "",
    }))
  }, [bookingDetails.date])

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
  }

  const handleDateChange = (date) => {
    setBookingDetails((prev) => ({
      ...prev,
      date,
      startTime: "",
      endTime: "",
    }))
  }

  const handleStartTimeChange = (time) => {
    setBookingDetails((prev) => ({
      ...prev,
      startTime: time,
      endTime: "",
    }))
  }

  const handleEndTimeChange = (time) => {
    setBookingDetails((prev) => ({
      ...prev,
      endTime: time,
    }))
  }

  const handleServiceToggle = (serviceId) => {
    setBookingDetails((prevDetails) => {
      const selectedServices = [...prevDetails.selectedServices]

      if (selectedServices.includes(serviceId)) {
        return {
          ...prevDetails,
          selectedServices: selectedServices.filter((id) => id !== serviceId),
        }
      } else {
        return {
          ...prevDetails,
          selectedServices: [...selectedServices, serviceId],
        }
      }
    })
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Calculate duration for display and calculations
  const duration = calculateDuration(bookingDetails.startTime, bookingDetails.endTime)

  return (
    <div className="container mx-auto p-4 md:p-1">
      <h1 className="text-3xl font-bold mb-6">Book Now</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Venue Details and Services */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">{venue.name}</h2>
            <img
              src={venue.image?.secure_url || "/placeholder.svg?height=300&width=500"}
              alt={venue.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <div className="space-y-2">
              <p className="flex items-center text-gray-600 mb-2">
                <MapPin className="mr-2" size={18} /> {venue.location.street}, {venue.location.city},{" "}
                {venue.location.province}
              </p>
              <p className="flex items-center">
                <Users className="mr-2" size={18} /> Capacity: {venue.capacity}
              </p>
              <p className="flex items-center">
                <DollarSign className="mr-2" size={18} /> Rs. {venue.basePricePerHour}
                /hour
              </p>
            </div>

            {/* Availability notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
              <Info className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
              <div className="text-sm text-blue-700">
                <p>The calendar shows available dates for booking. Select a date to see available time slots.</p>
                <p className="mt-1">
                  A 1-hour gap is automatically reserved between bookings for venue preparation and cleanup.
                </p>
              </div>
            </div>
          </div>

          {/* Services Selection - Moved from right to left column */}
          {venue.services && venue.services.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Package className="mr-2" size={18} />
                Additional Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venue.services.map((service) => (
                  <div
                    key={service.serviceId.id}
                    onClick={() => handleServiceToggle(service.serviceId.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-start ${
                      bookingDetails.selectedServices.includes(service.serviceId.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {/* Service Image */}
                    <div className="flex-shrink-0 mr-3">
                      {service.serviceId.image?.secure_url ? (
                        <img
                          src={service.serviceId.image.secure_url || "/placeholder.svg"}
                          alt={service.serviceId.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-sm">{service.serviceId.name}</p>
                      <p className="text-xs text-gray-600">
                        Rs. {service.servicePrice}
                        {service.category === "hourly" ? "/hour" : " (fixed)"}
                      </p>
                    </div>

                    <div
                      className={`ml-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        bookingDetails.selectedServices.includes(service.serviceId.id)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {bookingDetails.selectedServices.includes(service.serviceId.id) && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div>
          {/* Date Selection with Calendar - Moved from left to right column */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <DatePicker
              availableDates={availableDates}
              selectedDate={bookingDetails.date}
              onDateChange={handleDateChange}
              minDate={today}
            />
          </div>

          {/* Time Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Time</h3>
            {bookingDetails.date ? (
              <TimeSlotSelector
                availableTimeSlots={availableTimeSlotsForSelectedDate}
                selectedStartTime={bookingDetails.startTime}
                selectedEndTime={bookingDetails.endTime}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                bookings={data?.venue?.bookings || []}
                bookingDetails={bookingDetails}
              />
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Please select a date first to see available time slots</p>
              </div>
            )}
            {errors.time && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.time}
              </p>
            )}
          </div>

          {/* Customer Details */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
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

          {/* Price Summary & Payment */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

            {bookingDetails.startTime && bookingDetails.endTime ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>
                        {new Date(bookingDetails.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>
                        {formatTimeForDisplay(bookingDetails.startTime)} -{" "}
                        {formatTimeForDisplay(bookingDetails.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{duration} hours</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Venue Rental:</span>
                      <span>
                        Rs.{" "}
                        {calculateTotalPrice(bookingDetails.startTime, bookingDetails.endTime, venue.basePricePerHour)}
                      </span>
                    </div>

                    {bookingDetails.selectedServices.length > 0 && (
                      <>
                        <div className="pt-2 border-t">
                          <p className="font-medium mb-2">Additional Services:</p>
                          {bookingDetails.selectedServices.map((serviceId) => {
                            const service = venue.services.find((s) => s.serviceId.id === serviceId)
                            if (!service) return null

                            // Calculate service price based on category
                            const servicePrice =
                              service.category === "hourly" ? service.servicePrice * duration : service.servicePrice

                            return (
                              <div key={serviceId} className="flex justify-between text-sm pl-2 items-center py-1">
                                <div className="flex items-center">
                                  <span>{service.serviceId.name}</span>
                                  {service.category === "hourly" && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      (Rs. {service.servicePrice}/hr × {duration}hr)
                                    </span>
                                  )}
                                </div>
                                <span>Rs. {servicePrice}</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Total Amount:</span>
                      <span>Rs. {totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Esewa Payment Form */}
                <EsewaPaymentForm
                  venue={venueId}
                  start={bookingDetails.startTime}
                  end={bookingDetails.endTime}
                  date={bookingDetails.date}
                  selectedServices={bookingDetails.selectedServices}
                  totalAmount={totalPrice}
                  disabled={
                    !bookingDetails.date ||
                    !bookingDetails.startTime ||
                    !bookingDetails.endTime ||
                    !bookingDetails.name ||
                    !bookingDetails.email ||
                    !bookingDetails.phone
                  }
                />
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Please select a date and time to see booking summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookNowPage
