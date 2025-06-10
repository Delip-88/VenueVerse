"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@apollo/client"
import { GET_ALL_BOOKINGS, GET_ALL_VENUES, GET_ALL_USERS } from "../Graphql/query/Reports"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Calendar, ChevronDown, DollarSign, Users, Building, Printer } from "lucide-react"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30days")

  // Apollo queries
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_ALL_BOOKINGS)
  const { data: venuesData, loading: venuesLoading } = useQuery(GET_ALL_VENUES)
  const { data: usersData, loading: usersLoading } = useQuery(GET_ALL_USERS)

  const isLoading = bookingsLoading || venuesLoading || usersLoading

  // Revenue Data
  const revenueData = useMemo(() => {
    if (!bookingsData?.bookings) return []
    const map = {}
    bookingsData.bookings.forEach((b) => {
      let key
      if (dateRange === "lastYear") {
        const d = new Date(b.date)
        key = d.toLocaleString("en-US", { month: "short" })
      } else {
        const d = new Date(b.date)
        key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }
      map[key] = (map[key] || 0) + (b.totalPrice || 0)
    })
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }))
  }, [bookingsData, dateRange])

  // Bookings Data
  const bookingsChartData = useMemo(() => {
    if (!bookingsData?.bookings) return []
    const map = {}
    bookingsData.bookings.forEach((b) => {
      let key
      if (dateRange === "lastYear") {
        const d = new Date(b.date)
        key = d.toLocaleString("en-US", { month: "short" })
      } else {
        const d = new Date(b.date)
        key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }
      if (!map[key]) map[key] = { completed: 0, cancelled: 0, pending: 0 }
      if (b.bookingStatus === "APPROVED") map[key].completed++
      else if (b.bookingStatus === "CANCELLED") map[key].cancelled++
      else map[key].pending++
    })
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
  }, [bookingsData, dateRange])

  // Venue Category Data
  const categoryData = useMemo(() => {
    if (!venuesData?.venues) return []
    const catMap = {}
    venuesData.venues.forEach((v) => {
      v.categories.forEach((cat) => {
        catMap[cat] = (catMap[cat] || 0) + 1
      })
    })
    const colorMap = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]
    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      color: colorMap[idx % colorMap.length],
    }))
  }, [venuesData])

  // Venue Performance Data
  const venuePerformanceData = useMemo(() => {
    if (!venuesData?.venues) return []
    return venuesData.venues
      .map((v) => {
        const bookings = v.bookings ? v.bookings.length : 0
        const revenue = v.bookings ? v.bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) : 0
        const avgRating =
          v.reviews && v.reviews.length
            ? (v.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / v.reviews.length).toFixed(1)
            : "N/A"
        return {
          name: v.name,
          bookings,
          revenue,
          rating: avgRating,
        }
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
  }, [venuesData])

  // Region Data
  const regionData = useMemo(() => {
    if (!venuesData?.venues) return []
    const regionMap = {}
    venuesData.venues.forEach((v) => {
      const city = v.location?.city || "Unknown"
      regionMap[city] = (regionMap[city] || 0) + (v.bookings ? v.bookings.length : 0)
    })
    return Object.entries(regionMap).map(([subject, A]) => ({
      subject,
      A,
      fullMark: Math.max(...Object.values(regionMap), 1),
    }))
  }, [venuesData])

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (!revenueData.length || !bookingsChartData.length || !categoryData.length) return null
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
    const totalBookings = bookingsChartData.reduce(
      (sum, item) => sum + item.completed + item.cancelled + item.pending,
      0,
    )
    return {
      totalRevenue,
      totalBookings,
      revenueChange: 0,
      bookingsChange: 0,
      avgBookingValue: totalBookings ? totalRevenue / totalBookings : 0,
      topCategory: categoryData[0]?.name || "N/A",
    }
  }, [revenueData, bookingsChartData, categoryData])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Print report
  const printReport = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="flex items-center border rounded-md bg-white p-2">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-transparent pr-8 focus:outline-none text-sm"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="lastYear">Last Year</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2" />
            </div>
          </div>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={printReport}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {isLoading || !summaryMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summaryMetrics.totalRevenue)}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{summaryMetrics.totalBookings}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Booking Value</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summaryMetrics.avgBookingValue)}
                </h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Venue Category</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{summaryMetrics.topCategory}</h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-full">
                <Building className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Revenue Overview</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Booking Status</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#4ade80" />
                <Bar dataKey="pending" name="Pending" fill="#facc15" />
                <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Venue Categories</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryData.slice(0, 8).map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{category.value} venues</span>
                </div>
              ))}
              {categoryData.length > 8 && (
                <div className="pt-2 text-center">
                  <span className="text-xs text-gray-500">+{categoryData.length - 8} more categories</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Regional Distribution</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={regionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...regionData.map((r) => r.fullMark), 1)]} />
                <Radar name="Bookings" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Performing Venues */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Top Performing Venues</h2>
        </div>
        {isLoading ? (
          <div className="p-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venuePerformanceData.map((venue, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venue.bookings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(venue.revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venue.rating}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
