import { useState } from "react"
import { Calendar, MapPin, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"

// Mock data for bookings
const mockBookings = [
  {
    id: 1,
    venueName: "Elegant Ballroom",
    date: "2023-08-15",
    time: "18:00 - 23:00",
    status: "confirmed",
    guests: 150,
    totalPrice: 2500,
  },
  {
    id: 2,
    venueName: "Rustic Barn",
    date: "2023-09-22",
    time: "14:00 - 20:00",
    status: "pending",
    guests: 80,
    totalPrice: 1800,
  },
  {
    id: 3,
    venueName: "Beachfront Resort",
    date: "2023-07-10",
    time: "11:00 - 16:00",
    status: "completed",
    guests: 200,
    totalPrice: 3500,
  },
  {
    id: 4,
    venueName: "City View Rooftop",
    date: "2023-10-05",
    time: "19:00 - 23:00",
    status: "cancelled",
    guests: 100,
    totalPrice: 2200,
  },
]

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "completed":
        return "text-blue-600"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />
      case "pending":
        return <AlertCircle className="h-5 w-5" />
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  const handleCancelBooking = (bookingId) => {
    // In a real application, you would make an API call to cancel the booking
    setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)))
  }

  return (
    <div className="w-max mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 grid md:grid-cols-2 xs:grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 truncate">{booking.venueName}</h2>
                  <div className={`flex items-center ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <p className="ml-2 text-sm font-medium capitalize">{booking.status}</p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {booking.date}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {booking.time}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>Guests: {booking.guests}</p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <p className="text-sm font-medium text-gray-900">Total: ${booking.totalPrice}</p>
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === "completed" && (
                    <button className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

