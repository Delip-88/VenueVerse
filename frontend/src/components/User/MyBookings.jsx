"use client"

import { useContext, useEffect, useRef, useState } from "react"
import {
  Calendar,
  Star,
  X,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Timer,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Filter,
  ChevronDown,
} from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useMutation } from "@apollo/client"
import toast from "react-hot-toast"
import { CREATE_REVIEW } from "../Graphql/mutations/ReviewGql"
import { useNavigate } from "react-router-dom"

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "bg-teal-100 text-teal-800 border-teal-200"
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "REFUNDED":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getBookingStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "COMPLETED":
      return "bg-teal-100 text-teal-800 border-teal-200"
    case "CANCELLED":
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case "PAID":
      return <CreditCard className="w-4 h-4 mr-1" />
    case "PENDING":
      return <Clock className="w-4 h-4 mr-1" />
    case "REFUNDED":
      return <CreditCard className="w-4 h-4 mr-1" />
    default:
      return <CreditCard className="w-4 h-4 mr-1" />
  }
}

const FILTER_OPTIONS = [
  { value: "APPROVED", label: "Approved", color: "emerald" },
  { value: "PENDING", label: "Pending", color: "amber" },
  { value: "COMPLETED", label: "Completed", color: "teal" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
  { value: "REJECTED", label: "Rejected", color: "red" },
  { value: "ALL", label: "All Bookings", color: "gray" },
]

export default function MyBookingsPage() {
  const { user, loading } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [selectedFilter, setSelectedFilter] = useState("APPROVED") // Default to approved
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const commentRef = useRef(null)
  const navigate = useNavigate()

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  })

  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW)

  // Update current time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.bookings) {
      // Sort bookings by date (newest first)
      const sortedBookings = [...user.bookings].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
      setBookings(sortedBookings)
    }
  }, [user])

  // Filter bookings based on selected filter
  useEffect(() => {
    if (selectedFilter === "ALL") {
      setFilteredBookings(bookings)
    } else {
      const filtered = bookings.filter((booking) => booking.bookingStatus === selectedFilter)
      setFilteredBookings(filtered)
    }
  }, [bookings, selectedFilter])

  // Calculate countdown for upcoming events
  const getCountdown = (dateString, timeslots) => {
    if (!timeslots || timeslots.length === 0) return null

    const eventDate = new Date(dateString)
    const [hours, minutes] = timeslots[0].start.split(":").map(Number)
    eventDate.setHours(hours, minutes, 0, 0)

    const now = currentTime
    const diffTime = eventDate - now

    // If event has passed, return null
    if (diffTime <= 0) return null

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const remainingHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const remainingMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours: remainingHours, minutes: remainingMinutes }
  }

  // Format countdown display
  const formatCountdown = (countdown) => {
    if (!countdown) return null

    const parts = []
    if (countdown.days > 0) parts.push(`${countdown.days}d`)
    if (countdown.hours > 0) parts.push(`${countdown.hours}h`)
    if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`)

    return parts.join(" ")
  }

  // Check if booking is upcoming and approved
  const isUpcomingAndApproved = (dateString, timeslots, bookingStatus, paymentStatus) => {
    if (!timeslots || timeslots.length === 0) return false
    if (bookingStatus !== "APPROVED") return false

    const eventDate = new Date(dateString)
    const [hours, minutes] = timeslots[0].start.split(":").map(Number)
    eventDate.setHours(hours, minutes, 0, 0)

    return eventDate > currentTime
  }

  // Check if booking needs payment action
  const needsPaymentAction = (bookingStatus, paymentStatus) => {
    return bookingStatus === "PENDING" && paymentStatus === "PENDING"
  }

  // Handle proceed to payment
  const handleProceedToPayment = (booking) => {
    // Navigate to payment page with booking details
    navigate(`/payment/${booking.id}`, {
      state: {
        booking: booking,
        returnUrl: "/my-bookings",
      },
    })
  }

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue)
    setIsFilterDropdownOpen(false)
  }

  // Get filter count
  const getFilterCount = (filterValue) => {
    if (filterValue === "ALL") return bookings.length
    return bookings.filter((booking) => booking.bookingStatus === filterValue).length
  }

  if (loading) return <Loader />

  const handleReviewClick = (venue) => {
    setSelectedVenue(venue)
    setIsReviewModalOpen(true)
  }

  const handleGenerateReport = (booking) => {
    // Navigate to booking report page with booking data
    // You can pass the booking data through state or URL params
    navigate(`/booking-report/${booking.id}`)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) {
      toast.error("Please select a rating")
      return
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      await toast.promise(
        createReview({
          variables: {
            input: {
              venue: selectedVenue.id,
              rating: Number.parseInt(reviewForm.rating),
              comment: reviewForm.comment,
            },
          },
        }),
        {
          loading: "Submitting review...",
          success: "Review submitted successfully!",
          error: "Failed to submit review",
        },
      )
      setIsReviewModalOpen(false)
      setReviewForm({ rating: 0, comment: "" })
      setSelectedVenue(null)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const ReviewModal = () => (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Leave a Review</h3>
          <button
            onClick={() => setIsReviewModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              ref={commentRef}
              defaultValue={reviewForm.comment}
              onBlur={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this venue..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <CalendarDays className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600 mt-1">Track and manage all your venue bookings</p>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                <Filter className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {FILTER_OPTIONS.find((option) => option.value === selectedFilter)?.label}
                </span>
                <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                  {getFilterCount(selectedFilter)}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-2">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                          selectedFilter === option.value ? "bg-teal-50 text-teal-700" : "text-gray-700"
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            selectedFilter === option.value ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {getFilterCount(option.value)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-teal-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-teal-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {selectedFilter === "ALL" ? "No bookings yet" : `No ${selectedFilter.toLowerCase()} bookings`}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {selectedFilter === "ALL"
                ? "You haven't made any bookings yet. Start exploring our amazing venues to book your perfect event."
                : `You don't have any ${selectedFilter.toLowerCase()} bookings at the moment.`}
            </p>
            {selectedFilter === "ALL" && (
              <button
                onClick={() => navigate("/venues")}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Browse Venues
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const countdown = getCountdown(booking.date, booking.timeslots)
              const upcomingAndApproved = isUpcomingAndApproved(
                booking.date,
                booking.timeslots,
                booking.bookingStatus,
                booking.paymentStatus,
              )
              const needsPayment = needsPaymentAction(booking.bookingStatus, booking.paymentStatus)

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div
                        className="text-xl font-semibold text-teal-700 mb-2 md:mb-0 cursor-pointer hover:text-teal-800 flex items-center transition-colors"
                        onClick={() => navigate(`/venue/${booking.venue.id}`)}
                      >
                        {booking.venue.name}
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getBookingStatusColor(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getPaymentStatusColor(booking.paymentStatus)}`}
                        >
                          {getPaymentStatusIcon(booking.paymentStatus)}
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Payment Required Notice */}
                    {needsPayment && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-amber-100 rounded-full p-2 mr-3">
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800">Payment Required</p>
                              <p className="text-xs text-amber-600">Complete your payment to confirm this booking</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleProceedToPayment(booking)}
                            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors text-sm"
                          >
                            Proceed to Payment
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Countdown for upcoming approved events */}
                    {upcomingAndApproved && countdown && (
                      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-teal-100 rounded-full p-2 mr-3">
                              <Timer className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-teal-800">Event starts in</p>
                              <p className="text-lg font-bold text-teal-900">{formatCountdown(countdown)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-teal-600">Get ready!</p>
                            <p className="text-sm font-medium text-teal-800">
                              {new Date(booking.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {/* Date */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Time</p>
                          <div className="space-y-1">
                            {booking.timeslots.map((slot, index) => (
                              <p key={index} className="text-sm font-semibold text-gray-900">
                                {slot.start} - {slot.end}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                          <p className="text-sm font-semibold text-gray-900">Rs. {booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    {(booking.attendees || booking.eventType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {booking.attendees && (
                          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <Users className="h-5 w-5 text-blue-500 mr-3" />
                            <div>
                              <p className="text-xs text-blue-600 font-medium">Attendees</p>
                              <p className="text-sm font-semibold text-blue-900">{booking.attendees} people</p>
                            </div>
                          </div>
                        )}
                        {booking.eventType && (
                          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                            <div>
                              <p className="text-xs text-purple-600 font-medium">Event Type</p>
                              <p className="text-sm font-semibold text-purple-900">{booking.eventType}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Generate Report Button - Available for all confirmed bookings */}
                        {(booking.bookingStatus === "APPROVED" || booking.bookingStatus === "COMPLETED") && (
                          <button
                            onClick={() => handleGenerateReport(booking)}
                            className="flex-1 flex items-center justify-center py-3 px-4 text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="h-5 w-5 mr-2" />
                            Generate Report
                          </button>
                        )}

                        {/* Leave Review Button - Only for completed paid bookings */}
                        {booking.bookingStatus === "APPROVED" &&
                          booking.paymentStatus === "PAID" &&
                          new Date(booking.date) < new Date() && (
                            <button
                              onClick={() => handleReviewClick(booking.venue)}
                              className="flex-1 flex items-center justify-center py-3 px-4 text-teal-600 hover:text-teal-800 font-medium border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                            >
                              <Star className="h-5 w-5 mr-2" />
                              Leave Review
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && <ReviewModal />}
      </div>
    </div>
  )
}
