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
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Eye,
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
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "APPROVED":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800"
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

  // Loading skeleton for tables
  const TableSkeleton = ({ columns, rows = 3 }) => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 mb-4 rounded"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4 mb-4">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-8 bg-gray-100 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Super Admin Dashboard</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 border border-gray-200">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-teal-100 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-teal-600" />
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
                    stat.changeType === "increase" ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {stat.changeType === "increase" ? (
                    <ChevronUp className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-teal-500" />
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

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search venues, owners, or bookings..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Pending Approvals Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
            {pendingVenueOwners.length + pendingVenues.length} pending
          </span>
        </div>

        {/* Pending Venue Owners */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Pending Venue Owner Requests</h3>
            <p className="mt-1 text-sm text-gray-500">Approve or reject venue owner registration requests</p>
          </div>

          {pendingVenueOwnersLoading ? (
            <div className="p-6">
              <TableSkeleton columns={5} />
            </div>
          ) : (
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
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                        <div className="text-sm text-gray-500">{owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner?.companyName || "N/A"}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{owner?.address || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{owner?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{convertToDate(owner?.updatedAt) || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button className="inline-flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-md hover:bg-teal-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                          <button className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-100">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200">
              View All Requests
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pending Venue Approvals */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Pending Venue Approvals</h3>
            <p className="mt-1 text-sm text-gray-500">Approve or reject venue addition requests</p>
          </div>

          {pendingVenuesLoading ? (
            <div className="p-6">
              <TableSkeleton columns={7} />
            </div>
          ) : (
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
                  {pendingVenues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-gray-50">
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
                          <button className="inline-flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-md hover:bg-teal-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                          <button className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-100">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200">
              View All Venues
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Venues Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Popular Venues</h2>
          <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">View Analytics</button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Top Performing Venues</h3>
            <p className="mt-1 text-sm text-gray-500">Venues with the highest booking rates and ratings</p>
          </div>

          {popularVenuesLoading ? (
            <div className="p-6">
              <TableSkeleton columns={7} />
            </div>
          ) : (
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
                  {popularVenues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-gray-50">
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
                          <div className="text-sm text-gray-900 mr-2">
                            {venue.avgRating === 0 ? "N/A" : venue.avgRating.toFixed(1)}
                          </div>
                          <div className="flex">
                            {venue.avgRating !== 0 &&
                              [...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(venue.avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹ {venue.totalRevenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm font-medium">
                        <button className="inline-flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-md hover:bg-teal-200">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-100">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200">
              View All Popular Venues
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Latest Booking Activity</h3>
            <p className="mt-1 text-sm text-gray-500">Recent bookings across all venues</p>
          </div>

          {recentBookingsLoading ? (
            <div className="p-6">
              <TableSkeleton columns={7} />
            </div>
          ) : (
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
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
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
                        <div className="text-sm text-gray-900">₹ {booking.totalPrice}</div>
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
                          <button className="inline-flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-md hover:bg-teal-200">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <div className="relative group">
                            <button className="bg-gray-100 text-gray-600 p-1 rounded-md hover:bg-gray-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-100">
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Edit
                              </a>
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Cancel
                              </a>
                              <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                Delete
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-100">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200">
              View All Bookings
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
