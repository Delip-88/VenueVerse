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
  Activity,
  Eye,
  Filter,
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
  const totalRevenue = venues.reduce(
    (acc, venue) => acc + venue.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
    0,
  )
  const totalBookings = venues.reduce((acc, venue) => acc + venue.bookings.length, 0)
  const avgPrice = Math.round(venues.reduce((acc, venue) => acc + venue.basePricePerHour, 0) / venues.length || 0)

  const stats = [
    {
      title: "Active Venues",
      value: venues.length,
      icon: MapPin,
      change: "+12%",
      changeType: "positive",
      description: "Total venues listed",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      change: "+23%",
      changeType: "positive",
      description: "All-time bookings",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+18%",
      changeType: "positive",
      description: "Lifetime earnings",
    },
    {
      title: "Average Price/hr",
      value: `Rs. ${avgPrice}`,
      icon: Star,
      change: "+5%",
      changeType: "positive",
      description: "Across all venues",
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
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
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

  const hasAvailableSlots = (venue) => {
    const today = new Date()
    return venue.bookings.some((booking) => new Date(booking.date) >= today)
  }

  // Enhanced colors for charts with teal theme
  const COLORS = ["#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]
  const STATUS_COLORS = {
    APPROVED: "#10b981",
    PENDING: "#f59e0b",
    REJECTED: "#ef4444",
    CANCELLED: "#6b7280",
  }

  // Enhanced custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="py-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Welcome back! Here's an overview of your venue performance and bookings.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((item, index) => (
              <div
                key={item.title}
                className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-teal-50 rounded-lg">
                          <item.icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{item.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500">{item.description}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Analytics Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex">
                {[
                  { id: "overview", label: "Overview", icon: Activity },
                  { id: "revenue", label: "Revenue Analytics", icon: TrendingUp },
                  { id: "bookings", label: "Booking Insights", icon: BarChart3 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-teal-500 text-teal-600 bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Bookings */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                        <button
                          onClick={() => navigate("/Dashboard/bookings")}
                          className="text-sm text-teal-600 hover:text-teal-700 flex items-center font-medium transition-colors"
                        >
                          View all <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-6">
                        {recentBookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500">No bookings yet</p>
                            <p className="text-sm text-gray-400">Your recent bookings will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-gray-900">{booking.venue}</h4>
                                  <span
                                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                                      booking.status,
                                    )}`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {booking.user}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {booking.date}
                                  </div>
                                  <div className="font-semibold text-gray-900">{booking.amount}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* My Venues */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">My Venues</h3>
                        <button
                          onClick={() => navigate("/Dashboard/my-venues")}
                          className="text-sm text-teal-600 hover:text-teal-700 flex items-center font-medium transition-colors"
                        >
                          View all <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-6">
                        {venues.length === 0 ? (
                          <div className="text-center py-8">
                            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500">No venues added yet</p>
                            <p className="text-sm text-gray-400">Add your first venue to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {venues.slice(0, 3).map((venue) => (
                              <div
                                key={venue.id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                                onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-gray-900">{venue.name}</h4>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Rs. {venue.basePricePerHour}/hr
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {venue.location.city}, {venue.location.province}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span>{venue.bookings.length} bookings</span>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        hasAvailableSlots(venue)
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {hasAvailableSlots(venue) ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab Content */}
              {activeTab === "revenue" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Monthly Revenue Trend */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                          Monthly Revenue Trend
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Revenue performance over the last 6 months</p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              name="Revenue (Rs.)"
                              stroke="#14b8a6"
                              strokeWidth={3}
                              activeDot={{ r: 6, fill: "#14b8a6" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Venue Revenue Comparison */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                          Venue Revenue Comparison
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Total revenue generated by each venue</p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue (Rs.)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab Content */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Booking Status Distribution */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <PieChartIcon className="mr-2 h-5 w-5 text-teal-600" />
                          Booking Status Distribution
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Current status of all your bookings</p>
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
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                          Venue Booking Performance
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Number of bookings received by each venue</p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="bookings" name="Number of Bookings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Service Usage */}
                  {serviceUsageData.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Package className="mr-2 h-5 w-5 text-teal-600" />
                          Service Portfolio Analysis
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Distribution of services offered across your venue portfolio
                        </p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="count" name="Number of Venues" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
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
    </div>
  )
}

export default VendorDashboard
