import React, { act } from "react"
import { Users, Calendar, DollarSign, Star, PlusCircle, List, Settings, HelpCircle, MapPin, Clock } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

// Mock data (replace with actual data fetching in a real application)
const stats = [
  { title: "Total Users", value: "1,234", icon: Users },
  { title: "Total Bookings", value: "5,678", icon: Calendar },
  { title: "Revenue", value: "$123,456", icon: DollarSign },
  { title: "Avg. Rating", value: "4.7", icon: Star },
]

const recentBookings = [
  { id: 1, venue: "Sunset Beach Resort", user: "John Doe", date: "2025-01-26", status: "Confirmed" },
  { id: 2, venue: "Mountain View Lodge", user: "Jane Smith", date: "2025-01-27", status: "Pending" },
  { id: 3, venue: "City Center Hall", user: "Bob Johnson", date: "2025-01-28", status: "Cancelled" },
]

const popularVenues = [
  { id: 1, name: "Sunset Beach Resort", location: "Malibu, CA", rating: 4.8 },
  { id: 2, name: "Mountain View Lodge", location: "Aspen, CO", rating: 4.6 },
  { id: 3, name: "City Center Hall", location: "New York, NY", rating: 4.7 },
]

const VendorDashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
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

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Add New Venue", icon: PlusCircle, bgColor: "bg-blue-500", link:"add-venue" },
                { name: "Manage Bookings", icon: List, bgColor: "bg-green-500", link: "bookings" },
                { name: "System Settings", icon: Settings, bgColor: "bg-yellow-500" , link: "settings"},
                { name: "Help & Support", icon: HelpCircle, bgColor: "bg-purple-500" ,link: "help&support"},
              ].map((action) => (
                <button
                  key={action.name}
                  type="button"
                  className={`${action.bgColor} text-white rounded-lg shadow px-4 py-5 flex items-center justify-center text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500`} onClick={()=>navigate(action.link)}
                >
                  <action.icon className="h-6 w-6 mr-2" aria-hidden="true" />
                  {action.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Bookings and Popular Venues */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Recent Bookings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <li key={booking.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">{booking.venue}</div>
                        <div className="ml-2 flex-shrink-0 flex">
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
                            <time dateTime={booking.date}>{booking.date}</time>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Popular Venues */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Popular Venues</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {popularVenues.map((venue) => (
                    <li key={venue.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">{venue.name}</div>
                        <div className="ml-2 flex-shrink-0 flex">
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
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <p>View Details</p>
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

