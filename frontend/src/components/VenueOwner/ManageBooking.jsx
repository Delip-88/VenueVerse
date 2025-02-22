"use client"

import { useContext, useEffect, useState } from "react"
import { Check, X, Calendar, Clock, User, DollarSign, AlertCircle } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"

const ManageBookings = () => {
  const {user,loading} = useContext(AuthContext)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if(user?.bookings){
      setBookings(user.bookings)
    }

  }, [user])
  
  if(loading) return <Loader/>

  const handleApprove = (id) => {
    // setBookings((prevBookings) =>
    //   prevBookings.map((booking) => (booking.id === id ? { ...booking, bookingStatus: "APPROVED" } : booking)),
    // )
  }

  const handleReject = (id) => {
    // setBookings((prevBookings) =>
    //   prevBookings.map((booking) => (booking.id === id ? { ...booking, bookingStatus: "REJECTED" } : booking)),
    // )
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
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold mb-2">{booking.venue.name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
      <div className="flex justify-between items-center">
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
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => handleApprove(booking.id)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </button>
          <button
            onClick={() => handleReject(booking.id)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pending Bookings</h2>
        {bookings.filter((booking) => booking.bookingStatus === "PENDING").length === 0 ? (
          <p className="text-gray-500">No pending bookings.</p>
        ) : (
          bookings
            .filter((booking) => booking.bookingStatus === "PENDING")
            .map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Approved Bookings</h2>
        {bookings.filter((booking) => booking.bookingStatus === "APPROVED").length === 0 ? (
          <p className="text-gray-500">No approved bookings.</p>
        ) : (
          bookings
            .filter((booking) => booking.bookingStatus === "APPROVED")
            .map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Rejected Bookings</h2>
        {bookings.filter((booking) => booking.bookingStatus === "REJECTED").length === 0 ? (
          <p className="text-gray-500">No rejected bookings.</p>
        ) : (
          bookings
            .filter((booking) => booking.bookingStatus === "REJECTED")
            .map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  )
}

export default ManageBookings

