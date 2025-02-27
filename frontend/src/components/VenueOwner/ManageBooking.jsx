"use client"

import { useContext, useEffect, useState } from "react"
import { Check, X, Calendar, Clock, User, DollarSign, AlertCircle, ChevronDown, MapPin, Users } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useMutation, useQuery } from "@apollo/client"
import { APPROVE_BOOKING, REJECT_BOOKING } from "../Graphql/mutations/bookVenueGql"
import toast from "react-hot-toast"
import { MY_VENUES } from "../Graphql/query/meGql"

const ManageBookings = () => {
  const { loading } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [expandedVenues, setExpandedVenues] = useState({})
  const [expandedStatuses, setExpandedStatuses] = useState({})
  const [approveBooking] = useMutation(APPROVE_BOOKING)
  const [rejectBooking] = useMutation(REJECT_BOOKING)
  const { data, loading: venueLoading, error } = useQuery(MY_VENUES)

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues)
      // Initialize expanded states
      const venueStates = {}
      const statusStates = {}
      data.myVenues.forEach((venue) => {
        venueStates[venue.id] = true // Start expanded
        statusStates[venue.id] = {
          PENDING: true,
          APPROVED: true,
          REJECTED: true,
        }
      })
      setExpandedVenues(venueStates)
      setExpandedStatuses(statusStates)
    }
  }, [data])

  if (loading || venueLoading) return <Loader />
  if (error) return <div>Error : {error.message}</div>

  const handleApprove = async (id) => {
    try {
      await toast.promise(approveBooking({ variables: { bookingId: id } }), {
        loading: "Approving booking...",
        success: (response) => {
          const { success, message } = response.data?.approveBooking || {}
          if (success) {
            setVenues((prevVenues) =>
              prevVenues.map((venue) => ({
                ...venue,
                bookings: venue.bookings.map((booking) =>
                  booking.id === id ? { ...booking, bookingStatus: "APPROVED" } : booking,
                ),
              })),
            )
            return message || "Booking approved successfully!"
          } else {
            throw new Error("Failed to approve booking")
          }
        },
        error: (err) => err.message || "Failed to approve booking.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (id) => {
    try {
      await toast.promise(rejectBooking({ variables: { bookingId: id } }), {
        loading: "Rejecting booking...",
        success: (response) => {
          const { success, message } = response.data?.rejectBooking || {}
          if (success) {
            setVenues((prevVenues) =>
              prevVenues.map((venue) => ({
                ...venue,
                bookings: venue.bookings.map((booking) =>
                  booking.id === id ? { ...booking, bookingStatus: "REJECTED" } : booking,
                ),
              })),
            )
            return message || "Booking rejected successfully!"
          } else {
            throw new Error("Failed to reject booking")
          }
        },
        error: (err) => err.message || "Failed to reject booking.",
      })
    } catch (err) {
      console.error(err)
    }
  }

  const toggleVenue = (venueId) => {
    setExpandedVenues((prev) => ({
      ...prev,
      [venueId]: !prev[venueId],
    }))
  }

  const toggleStatus = (venueId, status) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [venueId]: {
        ...prev[venueId],
        [status]: !prev[venueId]?.[status],
      },
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600"
      case "PENDING":
        return "text-yellow-600"
      case "REJECTED":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "text-green-600"
      case "PENDING":
        return "text-yellow-600"
      case "REFUNDED":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const BookingCard = ({ booking }) => (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span>
            {booking.timeslots[0].start} - {booking.timeslots[0].end}
          </span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span>{booking.user.name}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
          <span>Rs. {booking.totalPrice}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className={`flex items-center ${getStatusColor(booking.bookingStatus)}`}>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Booking: {booking.bookingStatus}</span>
          </div>
          <div className={`flex items-center ${getPaymentStatusColor(booking.paymentStatus)}`}>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Payment: {booking.paymentStatus}</span>
          </div>
        </div>
        {booking.bookingStatus === "PENDING" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleApprove(booking.id)}
              className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded flex items-center justify-center cursor-pointer"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => handleReject(booking.id)}
              className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const VenueSection = ({ venue }) => {
    const pendingBookings = venue.bookings.filter((b) => b.bookingStatus === "PENDING")
    const approvedBookings = venue.bookings.filter((b) => b.bookingStatus === "APPROVED")
    const rejectedBookings = venue.bookings.filter((b) => b.bookingStatus === "REJECTED")

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div
          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleVenue(venue.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{venue.name}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {venue.location.city}, {venue.location.province}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Capacity: {venue.capacity}
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Rs. {venue.pricePerHour}/hour
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transform transition-transform ${expandedVenues[venue.id] ? "rotate-180" : ""}`}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              {pendingBookings.length} Pending
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              {approvedBookings.length} Approved
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              {rejectedBookings.length} Rejected
            </span>
          </div>
        </div>

        {expandedVenues[venue.id] && (
          <div className="p-4">
            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <div className="mb-6">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleStatus(venue.id, "PENDING")}
                >
                  <h4 className="text-md font-medium text-yellow-600">Pending Bookings</h4>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedStatuses[venue.id]?.PENDING ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedStatuses[venue.id]?.PENDING &&
                  pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
              </div>
            )}

            {/* Approved Bookings */}
            {approvedBookings.length > 0 && (
              <div className="mb-6">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleStatus(venue.id, "APPROVED")}
                >
                  <h4 className="text-md font-medium text-green-600">Approved Bookings</h4>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedStatuses[venue.id]?.APPROVED ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedStatuses[venue.id]?.APPROVED &&
                  approvedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
              </div>
            )}

            {/* Rejected Bookings */}
            {rejectedBookings.length > 0 && (
              <div className="mb-6">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleStatus(venue.id, "REJECTED")}
                >
                  <h4 className="text-md font-medium text-red-600">Rejected Bookings</h4>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedStatuses[venue.id]?.REJECTED ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedStatuses[venue.id]?.REJECTED &&
                  rejectedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
              </div>
            )}

            {venue.bookings.length === 0 && <p className="text-gray-500">No bookings for this venue.</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <div className="text-sm text-gray-600">
          Total Venues: {venues.length} | Total Bookings:{" "}
          {venues.reduce((acc, venue) => acc + venue.bookings.length, 0)}
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No venues found</h3>
          <p className="mt-2 text-gray-500">You haven't added any venues yet.</p>
        </div>
      ) : (
        venues.map((venue) => <VenueSection key={venue.id} venue={venue} />)
      )}
    </div>
  )
}

export default ManageBookings

