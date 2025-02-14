"use client"

import { useContext, useEffect, useState } from "react"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"

// Add a new function to get payment status color
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
export default function MyBookingsPage() {
  const { user, loading } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user?.bookings) {
      setBookings(user.bookings);
    }
  }, [user]); // Re-run effect when `user` changes

  if (loading) return <Loader />;

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600"
      case "PENDING":
        return "text-yellow-600"
      case "REJECTED":
        return "text-red-600"
      case "CANCELLED":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5" />
      case "PENDING":
        return <AlertCircle className="h-5 w-5" />
      case "REJECTED":
        return <XCircle className="h-5 w-5" />
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  const handleCancelBooking = (bookingId) => {
    // In a real application, you would make an API call to cancel the booking
    setBookings(
      bookings.map((booking) => (booking.id === bookingId ? { ...booking, bookingStatus: "CANCELLED" } : booking)),
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Venue
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Booking Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.venue.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.date}</div>
                  <div className="text-sm text-gray-500">
                    {booking.timeslots.map((slot, index) => (
                      <span key={index}>
                        {slot.start} - {slot.end}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Rs. {booking.totalPrice}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      booking.bookingStatus,
                    )} bg-${getStatusColor(booking.bookingStatus).split("-")[1]}-100`}
                  >
                    {getStatusIcon(booking.bookingStatus)}
                    <span className="ml-1">{booking.bookingStatus}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                      booking.paymentStatus,
                    )} bg-${getPaymentStatusColor(booking.paymentStatus).split("-")[1]}-100`}
                  >
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.bookingStatus === "APPROVED" && (
                    <button onClick={() => handleCancelBooking(booking.id)} className="text-red-600 hover:text-red-900">
                      Cancel
                    </button>
                  )}
                  {booking.bookingStatus === "APPROVED" && booking.paymentStatus === "PAID" && (
                    <button className="ml-4 text-blue-600 hover:text-blue-900">Leave Review</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

