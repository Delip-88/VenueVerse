"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  ArrowRight,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Package,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { MY_VENUES } from "../Graphql/query/meGql"
import Loader from "../../pages/common/Loader"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { data, loading, error } = useQuery(MY_VENUES)
  const [activeTab, setActiveTab] = useState("overview")
  const [revenueData, setRevenueData] = useState([])
  const [bookingStatusData, setBookingStatusData] = useState([])
  const [venuePopularityData, setVenuePopularityData] = useState([])
  const [serviceUsageData, setServiceUsageData] = useState([])

  useEffect(() => {
    if (data?.myVenues) {
      // Process data for charts
      processChartData(data.myVenues)
    }
  }, [data])

  const processChartData = (venues) => {
    // 1. Revenue data by month
    const revenueByMonth = {}
    venues.forEach((venue) => {
      venue.bookings.forEach((booking) => {
        const date = new Date(booking.date)
        const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0
        }
        revenueByMonth[monthYear] += booking.totalPrice
      })
    })

    const revenueChartData = Object.keys(revenueByMonth)
      .map((month) => ({
        month,
        revenue: revenueByMonth[month],
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(" ")
        const [bMonth, bYear] = b.month.split(" ")
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
      })
      .slice(-6) // Last 6 months

    setRevenueData(revenueChartData)

    // 2. Booking status distribution
    const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 }
    venues.forEach((venue) => {
      venue.bookings.forEach((booking) => {
        if (statusCounts[booking.bookingStatus] !== undefined) {
          statusCounts[booking.bookingStatus]++
        }
      })
    })

    const statusData = Object.keys(statusCounts)
      .map((status) => ({
        name: status,
        value: statusCounts[status],
      }))
      .filter((item) => item.value > 0)

    setBookingStatusData(statusData)

    // 3. Venue popularity (by number of bookings)
    const venueData = venues
      .map((venue) => ({
        name: venue.name.length > 15 ? venue.name.substring(0, 15) + "..." : venue.name,
        bookings: venue.bookings.length,
        revenue: venue.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      }))
      .sort((a, b) => b.bookings - a.bookings)

    setVenuePopularityData(venueData)

    // 4. Service usage
    const serviceUsage = {}
    venues.forEach((venue) => {
      venue.services.forEach((service) => {
        const serviceName = service.serviceId.name
        if (!serviceUsage[serviceName]) {
          serviceUsage[serviceName] = 0
        }
        serviceUsage[serviceName]++
      })
    })

    const serviceData = Object.keys(serviceUsage)
      .map((service) => ({
        name: service,
        count: serviceUsage[service],
      }))
      .sort((a, b) => b.count - a.count)

    setServiceUsageData(serviceData)
  }

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
      value: `Rs. ${Math.round(venues.reduce((acc, venue) => acc + venue.basePricePerHour, 0) / venues.length || 0)}`,
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

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  const STATUS_COLORS = {
    APPROVED: "#10b981",
    PENDING: "#f59e0b",
    REJECTED: "#ef4444",
    CANCELLED: "#6b7280",
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
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

          {/* Analytics Tabs */}
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === "revenue"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === "bookings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Bookings
                </button>
              </nav>
            </div>

            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                                  <span className="ml-1 text-sm text-gray-500">Rs. {venue.basePricePerHour}/hr</span>
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
            )}

            {/* Revenue Tab Content */}
            {activeTab === "revenue" && (
              <div className="mt-6 space-y-6">
                {/* Revenue Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Monthly Revenue Trend */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                        Monthly Revenue
                      </h3>
                      <p className="text-sm text-gray-500">Revenue trend over the last 6 months</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={revenueData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue (Rs.)"
                            stroke="#3b82f6"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Venue Revenue Comparison */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                        Venue Revenue
                      </h3>
                      <p className="text-sm text-gray-500">Revenue comparison by venue</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={venuePopularityData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="revenue" name="Revenue (Rs.)" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab Content */}
            {activeTab === "bookings" && (
              <div className="mt-6 space-y-6">
                {/* Booking Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Booking Status Distribution */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <PieChartIcon className="mr-2 h-5 w-5 text-blue-500" />
                        Booking Status
                      </h3>
                      <p className="text-sm text-gray-500">Distribution of booking statuses</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bookingStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {bookingStatusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Venue Popularity */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                        Venue Popularity
                      </h3>
                      <p className="text-sm text-gray-500">Number of bookings by venue</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={venuePopularityData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="bookings" name="Number of Bookings" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Service Usage */}
                {serviceUsageData.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Package className="mr-2 h-5 w-5 text-blue-500" />
                        Service Offerings
                      </h3>
                      <p className="text-sm text-gray-500">Distribution of services across your venues</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={serviceUsageData}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 100,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="count" name="Number of Venues" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard

