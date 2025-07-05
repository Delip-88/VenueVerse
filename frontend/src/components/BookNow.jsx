"use client"

import { useState, useEffect, useContext, useMemo } from "react"
import {
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Check,
  Package,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarIcon,
  User,
  CreditCard,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { VENUE_BY_ID } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../middleware/AuthContext"
import EsewaPaymentForm from "./EsewaPaymentForm"
import { calculateTotalPrice } from "./Functions/calc"

// Format date as YYYY-MM-DD for comparison (local time)
const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Calendar component for date selection with availability indicators
const DatePicker = ({ availableDates, selectedDate, onDateChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get days in month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

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
    calendarDays.push(<div key={`empty-${i}`} className="h-12"></div>)
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
        className={`h-12 w-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
          ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
          ${isSelected ? "bg-teal-600 text-white shadow-md" : ""}
          ${!isPast && isAvailable && !isSelected ? "hover:bg-teal-50 hover:text-teal-600 text-gray-700" : ""}
          ${!isPast && !isAvailable ? "text-gray-400 cursor-not-allowed" : ""}
        `}
      >
        {day}
      </button>,
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthName} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-teal-600 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-gray-300 mr-2"></div>
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
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12
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
    <div className="space-y-6">
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-3">
          Start Time
        </label>
        <div className="relative">
          <select
            id="startTime"
            value={selectedStartTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="appearance-none pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
            disabled={availableTimeSlots.length === 0}
          >
            <option value="">Select start time</option>
            {availableTimeSlots.map((time) => (
              <option key={`start-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <Clock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-3">
          End Time
        </label>
        <div className="relative">
          <select
            id="endTime"
            value={selectedEndTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="appearance-none pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
            disabled={!selectedStartTime || availableEndTimes.length === 0}
          >
            <option value="">Select end time</option>
            {availableEndTimes.map((time) => (
              <option key={`end-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <Clock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="text-teal-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
          <div className="text-sm text-teal-700">
            <p className="font-medium">Booking Policy</p>
            <p className="mt-1">
              A 1-hour gap is automatically reserved between bookings for venue preparation and cleanup.
            </p>
          </div>
        </div>
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

// Helper function to format category names for display
const formatCategoryName = (category) => {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

const BookNowPage = () => {
  const { venueId } = useParams() || {}
  const { user } = useContext(AuthContext)
  const [currentStep, setCurrentStep] = useState(1)

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
    phone: user?.phone || "",
    selectedServices: [],
    eventType: "",
    attendees: "",
    additionalNotes: "",
  })

  const [errors, setErrors] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)

  const validateForm = () => {
    return Object.keys(errors).length === 0
  }

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
      dates.push(formatDateString(date)) // use local date formatting
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }))

    // Validate specific fields
    const newErrors = { ...errors }
    delete newErrors[name] // Clear existing error for this field

    // Validation for attendees
    if (name === "attendees") {
      if (!value || value.trim() === "") {
        newErrors.attendees = "Number of attendees is required."
      } else if (isNaN(value) || Number(value) <= 0) {
        newErrors.attendees = "Attendees must be a positive number."
      } else if (Number.parseInt(value, 10) > venue.capacity) {
        newErrors.attendees = `Attendees cannot exceed the venue capacity of ${venue.capacity}.`
      }
    }

    setErrors(newErrors)
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

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return bookingDetails.date && bookingDetails.startTime && bookingDetails.endTime
      case 2:
        return true // Services are optional
      case 3:
        return (
          bookingDetails.phone &&
          bookingDetails.eventType &&
          bookingDetails.attendees &&
          Object.keys(errors).length === 0
        )
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  // Prevent selecting today's date
  const isDateSelectable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(date) > today
  }

  // Prevent selecting today's time
  const isTimeSelectable = (time) => {
    if (bookingDetails.date !== today) return true // Only restrict for today
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const timeMinutes = timeToMinutes(time)
    return timeMinutes > currentMinutes
  }

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>

  const venue = data.venue

  // Get today's date in YYYY-MM-DD format
  const today = formatDateString(new Date())

  // Calculate duration for display and calculations
  const duration = calculateDuration(bookingDetails.startTime, bookingDetails.endTime)

  // Progress calculation
  const totalSteps = 4
  const progress = Math.round((currentStep / totalSteps) * 100)

  // Step content renderer
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CalendarIcon className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
              <p className="text-gray-600">Choose your preferred date and time slot for the event</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Dates</h3>
                <DatePicker
                  availableDates={availableDates.filter(isDateSelectable)}
                  selectedDate={bookingDetails.date}
                  onDateChange={handleDateChange}
                  minDate={today}
                />
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slots</h3>
                {bookingDetails.date ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <TimeSlotSelector
                      availableTimeSlots={availableTimeSlotsForSelectedDate.filter(isTimeSelectable)}
                      selectedStartTime={bookingDetails.startTime}
                      selectedEndTime={bookingDetails.endTime}
                      onStartTimeChange={handleStartTimeChange}
                      onEndTimeChange={handleEndTimeChange}
                      bookings={data?.venue?.bookings || []}
                      bookingDetails={bookingDetails}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Please select a date first to see available time slots</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Services</h2>
              <p className="text-gray-600">Enhance your event with our premium services (optional)</p>
            </div>

            {venue.services && venue.services.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {venue.services.map((service) => (
                  <div
                    key={service.serviceId.id}
                    onClick={() => handleServiceToggle(service.serviceId.id)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      bookingDetails.selectedServices.includes(service.serviceId.id)
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Service Image */}
                      <div className="flex-shrink-0">
                        {service.serviceId.image?.secure_url ? (
                          <img
                            src={service.serviceId.image.secure_url || "/placeholder.svg"}
                            alt={service.serviceId.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{service.serviceId.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Rs. {service.servicePrice}
                          {service.category === "hourly" ? "/hour" : " (fixed)"}
                        </p>
                        {service.serviceId.description && (
                          <p className="text-sm text-gray-500">{service.serviceId.description}</p>
                        )}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          bookingDetails.selectedServices.includes(service.serviceId.id)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {bookingDetails.selectedServices.includes(service.serviceId.id) && <Check size={16} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600">No additional services available for this venue</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Details</h2>
              <p className="text-gray-600">Tell us about your event and contact information</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Event Type Selection */}
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-3">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="eventType"
                    name="eventType"
                    value={bookingDetails.eventType}
                    onChange={handleInputChange}
                    className="appearance-none pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                    required
                  >
                    <option value="">Select event type</option>
                    {venue.categories &&
                      venue.categories.map((category) => (
                        <option key={category} value={category}>
                          {formatCategoryName(category)}
                        </option>
                      ))}
                  </select>
                  <Package className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.eventType && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.eventType}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-3">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingDetails.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Attendees <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="attendees"
                    name="attendees"
                    value={bookingDetails.attendees}
                    onChange={handleInputChange}
                    placeholder="Expected number of guests"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  {errors.attendees && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.attendees}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={bookingDetails.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or additional information for the venue owner..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Payment</h2>
              <p className="text-gray-600">Review your booking details and proceed to payment</p>
            </div>

            <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
              {/* Venue Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={venue.image?.secure_url || "/placeholder.svg?height=100&width=150"}
                      alt={venue.name}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {venue.location.street}, {venue.location.city}, {venue.location.province}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        Capacity: {venue.capacity} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(bookingDetails.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTimeForDisplay(bookingDetails.startTime)} - {formatTimeForDisplay(bookingDetails.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Type:</span>
                    <span className="font-medium">
                      {bookingDetails.eventType ? formatCategoryName(bookingDetails.eventType) : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendees:</span>
                    <span className="font-medium">{bookingDetails.attendees} people</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue Rental:</span>
                      <span className="font-medium">
                        Rs.{" "}
                        {calculateTotalPrice(bookingDetails.startTime, bookingDetails.endTime, venue.basePricePerHour)}
                      </span>
                    </div>

                    {bookingDetails.selectedServices.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Additional Services:</p>
                        {bookingDetails.selectedServices.map((serviceId) => {
                          const service = venue.services.find((s) => s.serviceId.id === serviceId)
                          if (!service) return null

                          const servicePrice =
                            service.category === "hourly" ? service.servicePrice * duration : service.servicePrice

                          return (
                            <div key={serviceId} className="flex justify-between text-sm">
                              <span className="text-gray-600">{service.serviceId.name}</span>
                              <span>Rs. {servicePrice}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-teal-600">Rs. {totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="mt-6">
                  <EsewaPaymentForm
                    venue={venueId}
                    start={bookingDetails.startTime}
                    end={bookingDetails.endTime}
                    date={bookingDetails.date}
                    selectedServices={bookingDetails.selectedServices}
                    totalAmount={totalPrice}
                    additionalNotes={bookingDetails.additionalNotes}
                    phone={bookingDetails.phone}
                    eventType={bookingDetails.eventType}
                    attendees={bookingDetails.attendees}
                    disabled={!validateForm()}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Venue</h1>
          <p className="text-gray-600">Complete your booking in just a few simple steps</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between">
            {[
              { number: 1, title: "Date & Time", icon: CalendarIcon },
              { number: 2, title: "Services", icon: Package },
              { number: 3, title: "Details", icon: User },
              { number: 4, title: "Payment", icon: CreditCard },
            ].map((step) => {
              const isActive = step.number === currentStep
              const isCompleted = step.number < currentStep

              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-teal-600 text-white shadow-lg"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps && (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookNowPage
