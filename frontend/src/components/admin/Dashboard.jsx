"use client"

import {
  Building,
  Users,
  Calendar,
  BarChart2,
  Plus,
  ChevronUp,
  ChevronDown,
  Star,
  Bell,
  MoreHorizontal,
} from "lucide-react"
import { PENDING_VENUE_APPROVAL, PENDING_VENUE_OWNER, RECENT_BOOKINGS, TOP_VENUES } from "../Graphql/query/AdminQuery"
import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { convertToDate } from "../Functions/calc"

export default function SuperAdminDashboard() {
  // Sample data for dashboard
  const stats = [
    { name: "Total Venues", value: "1,284", change: "+12%", changeType: "increase", icon: Building },
    { name: "Active Venue Owners", value: "342", change: "+5%", changeType: "increase", icon: Users },
    { name: "Total Bookings", value: "8,492", change: "+18%", changeType: "increase", icon: Calendar },
    { name: "Total Revenue", value: "₹ 24,56,789", change: "+22%", changeType: "increase", icon: BarChart2 },
  ]

  const [pendingVenueOwners, setPendingVenueOwners] = useState([])
  const [pendingVenues, setPendingVenues] = useState([])
  const [popularVenues, setPopularVenues] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const {
    data: pendingVenueOwnersData,
    loading: pendingVenueOwnersLoading,
    error: pendingVenueOwnersError,
  } = useQuery(PENDING_VENUE_OWNER)
  const {
    data: pendingVenuesData,
    loading: pendingVenuesLoading,
    error: pendingVenuesError,
  } = useQuery(PENDING_VENUE_APPROVAL)
  const { data: popularVenuesData, loading: popularVenuesLoading, error: popularVenuesError } = useQuery(TOP_VENUES)
  const {
    data: recentBookingsData,
    loading: recentBookingsLoading,
    error: recentBookingsError,
  } = useQuery(RECENT_BOOKINGS)

  useEffect(() => {
    if (pendingVenueOwnersData) {
      setPendingVenueOwners(pendingVenueOwnersData.pendingVenueOwners)
    }
    if (pendingVenuesData) {
      setPendingVenues(pendingVenuesData.pendingVenues)
    }
    if (popularVenuesData) {
      setPopularVenues(popularVenuesData.topVenues)
    }
    if (recentBookingsData) {
      setRecentBookings(recentBookingsData.recentBookings)
    }
  }, [pendingVenueOwnersData, recentBookingsData, pendingVenuesData, popularVenuesData])

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "APPROVED":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Function to limit categories display to 2 with a +n more indicator
  const displayLimitedCategories = (categories) => {
    if (!categories || categories.length === 0) return null

    return (
      <div className="flex flex-wrap gap-1">
        {categories.slice(0, 2).map((category, idx) => (
          <span
            key={idx}
            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
          >
            {formatCategory(category)}
          </span>
        ))}
        {categories.length > 2 && (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            +{categories.length - 2} more
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Super Admin Dashboard</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div
                  className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    stat.changeType === "increase" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {stat.changeType === "increase" ? (
                    <ChevronUp className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500" />
                  ) : (
                    <ChevronDown className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500" />
                  )}
                  <span className="sr-only">{stat.changeType === "increase" ? "Increased" : "Decreased"} by</span>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>

        {/* Pending Venue Owners */}
        {pendingVenueOwnersLoading ? (
          <div className="mt-4 p-6 bg-white rounded-lg shadow flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Pending Venue Owner Requests</h3>
              <p className="mt-1 text-sm text-gray-500">Approve or reject venue owner registration requests</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
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
                  {pendingVenueOwners.map((owner) => (
                    <tr key={owner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                        <div className="text-sm text-gray-500">{owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner?.description || "N/A"}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{owner?.description || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{owner?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{convertToDate(owner?.updatedAt) || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button className="bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200">
                            Approve
                          </button>
                          <button className="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">
                            Reject
                          </button>
                          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                View All Requests
              </button>
            </div>
          </div>
        )}

        {/* Pending Venue Approvals */}
        <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Pending Venue Approvals</h3>
            <p className="mt-1 text-sm text-gray-500">Approve or reject venue addition requests</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Venue Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Owner
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categories
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Capacity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price/Hour
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
                {pendingVenuesLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading venues...</p>
                    </td>
                  </tr>
                ) : (
                  pendingVenues.map((venue) => (
                    <tr key={venue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{venue.owner.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {venue.location.city}, {venue.location.province}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{displayLimitedCategories(venue.categories)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{venue.capacity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">₹ {venue.basePricePerHour}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button className="bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200">
                            Approve
                          </button>
                          <button className="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">
                            Reject
                          </button>
                          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              View All Venues
            </button>
          </div>
        </div>
      </div>

      {/* Popular Venues Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Popular Venues</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Top Performing Venues</h3>
            <p className="mt-1 text-sm text-gray-500">Venues with the highest booking rates and ratings</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Venue Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categories
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Bookings
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Revenue
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
                {popularVenuesLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading popular venues...</p>
                    </td>
                  </tr>
                ) : (
                  popularVenues.map((venue) => (
                    <tr key={venue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {venue.location.city}, {venue.location.province}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{displayLimitedCategories(venue.categories)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{venue.totalBookings}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">{venue.avgRating === 0 ? "N/A" : venue.avgRating}</div>
                          <div className="ml-1 flex">
                            {venue.avgRating !== 0 &&
                              [...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(venue.avgRating) ? "text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{venue.totalRevenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <div className="flex items-center">
                          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              View All Popular Venues
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="mt-8 mb-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Latest Booking Activity</h3>
            <p className="mt-1 text-sm text-gray-500">Recent bookings across all venues</p>
          </div>
          <div className="overflow-x-auto">
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
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
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
                {recentBookingsLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading bookings...</p>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.venue.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{booking.user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{convertToDate(booking.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {booking.timeslots && booking.timeslots.length > 0
                            ? `${booking.timeslots[0].start}-${booking.timeslots[0].end}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.totalPrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200">
                            View
                          </button>
                          <div className="relative group">
                            <button className="bg-gray-100 text-gray-600 p-1 rounded-md hover:bg-gray-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Edit
                              </a>
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Cancel
                              </a>
                              <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                Delete
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              View All Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

