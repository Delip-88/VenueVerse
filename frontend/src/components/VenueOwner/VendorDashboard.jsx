import { Users, Calendar, DollarSign, Star, MapPin, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { MY_VENUES } from "../Graphql/query/meGql"
import Loader from "../../pages/common/Loader"

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { data, loading, error } = useQuery(MY_VENUES)

  if (loading) return <Loader />
  if (error) return <div>Error: {error.message}</div>

  const venues = data?.myVenues || []

  // Calculate stats
  const stats = [
    {
      title: "Active Venues",
      value: venues.length,
      icon: MapPin,
    },
    {
      title: "Total Bookings",
      value: venues.reduce((acc, venue) => acc + venue.bookings.length, 0),
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: `Rs. ${venues
        .reduce((acc, venue) => acc + venue.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0), 0)
        .toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Average Price/hr",
      value: `Rs. ${Math.round(venues.reduce((acc, venue) => acc + venue.pricePerHour, 0) / venues.length || 0)}`,
      icon: Star,
    },
  ]

  // Get recent bookings across all venues
  const recentBookings = venues
    .flatMap((venue) =>
      venue.bookings.map((booking) => ({
        id: booking.id,
        venue: venue.name,
        user: booking.user.name,
        date: booking.date,
        time: `${booking.timeslots[0].start} - ${booking.timeslots[0].end}`,
        status: booking.bookingStatus,
        amount: `Rs. ${booking.totalPrice}`,
      })),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const hasAvailableSlots = (venue) => {
    const today = new Date()
    return venue.bookings.some((booking) => new Date(booking.date) >= today)
  }

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
                {recentBookings.length === 0 ? (
                  <p className="px-4 py-5 text-center text-gray-500">No bookings yet</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <li key={booking.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">{booking.venue}</div>
                          <div className="ml-2 flex-shrink-0 flex items-center">
                            <span className="text-sm text-gray-500 mr-4">{booking.amount}</span>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                                booking.status,
                              )}`}
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
                )}
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
                {venues.length === 0 ? (
                  <p className="px-4 py-5 text-center text-gray-500">No venues added yet</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {venues.slice(0, 3).map((venue) => (
                      <li
                        key={venue.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">{venue.name}</div>
                          <div className="ml-2 flex-shrink-0 flex items-center">
                            <DollarSign className="text-gray-400 h-5 w-5" aria-hidden="true" />
                            <span className="ml-1 text-sm text-gray-500">Rs. {venue.pricePerHour}/hr</span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {venue.location.city}, {venue.location.province}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm sm:mt-0">
                            <p className="text-gray-500">{venue.bookings.length} bookings</p>
                            <span
                              className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                hasAvailableSlots(venue)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {hasAvailableSlots(venue) ? "Has Bookings" : "No Bookings"}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard

