import { Users, Calendar, DollarSign, Star, MapPin, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Mock data (replace with actual data fetching in a real application)
const stats = [
  { title: "Active Venues", value: "12", icon: MapPin },
  { title: "Total Bookings", value: "156", icon: Calendar },
  { title: "Monthly Revenue", value: "$12,456", icon: DollarSign },
  { title: "Average Rating", value: "4.7", icon: Star },
]

const recentBookings = [
  {
    id: 1,
    venue: "Grand Ballroom",
    user: "John Doe",
    date: "2025-01-26",
    time: "14:00 - 18:00",
    status: "Confirmed",
    amount: "$1,200",
  },
  {
    id: 2,
    venue: "Garden Terrace",
    user: "Jane Smith",
    date: "2025-01-27",
    time: "18:00 - 22:00",
    status: "Pending",
    amount: "$800",
  },
  {
    id: 3,
    venue: "Conference Hall A",
    user: "Bob Johnson",
    date: "2025-01-28",
    time: "09:00 - 17:00",
    status: "Cancelled",
    amount: "$2,400",
  },
]

const myVenues = [
  {
    id: 1,
    name: "Grand Ballroom",
    location: "Downtown Area",
    rating: 4.8,
    bookingsThisMonth: 12,
    availability: "Available",
  },
  {
    id: 2,
    name: "Garden Terrace",
    location: "Riverside",
    rating: 4.6,
    bookingsThisMonth: 8,
    availability: "Booked",
  },
  {
    id: 3,
    name: "Conference Hall A",
    location: "Business District",
    rating: 4.7,
    bookingsThisMonth: 15,
    availability: "Available",
  },
]

const VendorDashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of your venues and bookings</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.title} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                          <dd className="text-2xl font-semibold text-gray-900">{item.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings and My Venues */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Recent Bookings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
                <button
                  onClick={() => navigate("/Dashboard/bookings")}
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <li key={booking.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">{booking.venue}</div>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <span className="text-sm text-gray-500 mr-4">{booking.amount}</span>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "Confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {booking.user}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <p>
                            {booking.date} • {booking.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* My Venues */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Venues</h3>
                <button
                  onClick={() => navigate("/Dashboard/my-venues")}
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {myVenues.map((venue) => (
                    <li
                      key={venue.id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">{venue.name}</div>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <Star className="text-yellow-400 h-5 w-5" aria-hidden="true" />
                          <span className="ml-1 text-sm text-gray-500">{venue.rating}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {venue.location}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm sm:mt-0">
                          <p className="text-gray-500">{venue.bookingsThisMonth} bookings this month</p>
                          <span
                            className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              venue.availability === "Available"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {venue.availability}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard

