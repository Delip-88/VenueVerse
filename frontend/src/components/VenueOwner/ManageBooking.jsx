import React, { useState } from "react"
import { Check, X, Calendar, Clock, User, DollarSign } from "lucide-react"

const ManageBookings = () => {
  const [bookings, setBookings] = useState({
    pending: [
      { id: 1, venueName: "Grand Hall", date: "2023-06-15", time: "14:00-18:00", user: "John Doe", price: 500 },
      { id: 2, venueName: "Rooftop Terrace", date: "2023-06-18", time: "19:00-23:00", user: "Jane Smith", price: 750 },
    ],
    reserved: [
      {
        id: 3,
        venueName: "Conference Room A",
        date: "2023-06-20",
        time: "09:00-17:00",
        user: "Alice Johnson",
        price: 1000,
      },
      {
        id: 4,
        venueName: "Garden Pavilion",
        date: "2023-06-25",
        time: "12:00-16:00",
        user: "Bob Williams",
        price: 600,
      },
    ],
  })

  const handleApprove = (id) => {
    const approvedBooking = bookings.pending.find((booking) => booking.id === id)
    setBookings((prevBookings) => ({
      pending: prevBookings.pending.filter((booking) => booking.id !== id),
      reserved: [...prevBookings.reserved, approvedBooking],
    }))
  }

  const handleReject = (id) => {
    setBookings((prevBookings) => ({
      ...prevBookings,
      pending: prevBookings.pending.filter((booking) => booking.id !== id),
    }))
  }

  const BookingCard = ({ booking, isPending }) => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold mb-2">{booking.venueName}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span>{booking.time}</span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span>{booking.user}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
          <span>${booking.price}</span>
        </div>
      </div>
      {isPending && (
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
        {bookings.pending.length === 0 ? (
          <p className="text-gray-500">No pending bookings.</p>
        ) : (
          bookings.pending.map((booking) => <BookingCard key={booking.id} booking={booking} isPending={true} />)
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Reserved Bookings</h2>
        {bookings.reserved.length === 0 ? (
          <p className="text-gray-500">No reserved bookings.</p>
        ) : (
          bookings.reserved.map((booking) => <BookingCard key={booking.id} booking={booking} isPending={false} />)
        )}
      </div>
    </div>
  )
}

export default ManageBookings

