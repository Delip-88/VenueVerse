"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts"
import {
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  AlertCircle,
  Printer,
  Share2,
} from "lucide-react"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30days")
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState({})
  const [activeTab, setActiveTab] = useState("overview")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: "all",
    region: "all",
    minBookings: "",
    minRevenue: "",
  })

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      setChartData({
        revenueData: generateRevenueData(dateRange),
        bookingsData: generateBookingsData(dateRange),
        categoryData: generateCategoryData(),
        venuePerformanceData: generateVenuePerformanceData(),
        hourlyBookingsData: generateHourlyBookingsData(),
        userAcquisitionData: generateUserAcquisitionData(),
        regionData: generateRegionData(),
        forecastData: generateForecastData(),
        customerSatisfactionData: generateCustomerSatisfactionData(),
        seasonalTrendsData: generateSeasonalTrendsData(),
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [dateRange, filters])

  // Generate sample data based on date range
  const generateRevenueData = (range) => {
    const data = []
    let days = 30

    if (range === "last7days") days = 7
    else if (range === "last30days") days = 30
    else if (range === "last90days") days = 90
    else if (range === "lastYear") days = 12 // months

    if (range === "lastYear") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      for (let i = 0; i < days; i++) {
        data.push({
          name: months[i],
          revenue: Math.floor(Math.random() * 500000) + 100000,
          bookings: Math.floor(Math.random() * 200) + 50,
        })
      }
    } else {
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        data.push({
          name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: Math.floor(Math.random() * 50000) + 10000,
          bookings: Math.floor(Math.random() * 20) + 5,
        })
      }
    }

    return data
  }

  const generateBookingsData = (range) => {
    const data = []
    let days = 30

    if (range === "last7days") days = 7
    else if (range === "last30days") days = 30
    else if (range === "last90days") days = 90
    else if (range === "lastYear") days = 12 // months

    if (range === "lastYear") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      for (let i = 0; i < days; i++) {
        data.push({
          name: months[i],
          completed: Math.floor(Math.random() * 150) + 50,
          cancelled: Math.floor(Math.random() * 30) + 5,
          pending: Math.floor(Math.random() * 40) + 10,
        })
      }
    } else {
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        data.push({
          name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          completed: Math.floor(Math.random() * 15) + 5,
          cancelled: Math.floor(Math.random() * 3) + 1,
          pending: Math.floor(Math.random() * 4) + 2,
        })
      }
    }

    return data
  }

  const generateCategoryData = () => {
    return [
      { name: "Wedding", value: 35, color: "#8884d8" },
      { name: "Conference", value: 25, color: "#82ca9d" },
      { name: "Party", value: 20, color: "#ffc658" },
      { name: "Banquet", value: 15, color: "#ff8042" },
      { name: "Outdoor", value: 5, color: "#0088fe" },
    ]
  }

  const generateVenuePerformanceData = () => {
    return [
      { name: "Royal Banquet Hall", bookings: 245, revenue: 1225000, rating: 4.8 },
      { name: "City Conference Center", bookings: 189, revenue: 945000, rating: 4.6 },
      { name: "Himalayan View Resort", bookings: 156, revenue: 1560000, rating: 4.9 },
      { name: "Downtown Party Zone", bookings: 132, revenue: 660000, rating: 4.5 },
      { name: "Garden Wedding Venue", bookings: 128, revenue: 896000, rating: 4.7 },
    ]
  }

  const generateHourlyBookingsData = () => {
    const data = []
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: i,
        bookings: Math.floor(Math.random() * 10) + (i >= 9 && i <= 21 ? 5 : 0), // More bookings during business hours
      })
    }
    return data
  }

  const generateUserAcquisitionData = () => {
    return [
      { name: "Direct", value: 40 },
      { name: "Organic Search", value: 30 },
      { name: "Social Media", value: 15 },
      { name: "Referral", value: 10 },
      { name: "Email", value: 5 },
    ]
  }

  const generateRegionData = () => {
    return [
      { subject: "Kathmandu", A: 120, fullMark: 150 },
      { subject: "Pokhara", A: 98, fullMark: 150 },
      { subject: "Lalitpur", A: 86, fullMark: 150 },
      { subject: "Bhaktapur", A: 99, fullMark: 150 },
      { subject: "Biratnagar", A: 85, fullMark: 150 },
      { subject: "Birgunj", A: 65, fullMark: 150 },
    ]
  }

  // New data generators for additional charts
  const generateForecastData = () => {
    const data = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Historical data (past 6 months)
    for (let i = 0; i < 6; i++) {
      data.push({
        name: months[i],
        actual: Math.floor(Math.random() * 300000) + 200000,
        type: "historical",
      })
    }

    // Forecast data (next 6 months)
    for (let i = 6; i < 12; i++) {
      const baseValue = Math.floor(Math.random() * 350000) + 250000
      data.push({
        name: months[i],
        forecast: baseValue,
        optimistic: Math.floor(baseValue * 1.2),
        pessimistic: Math.floor(baseValue * 0.8),
        type: "forecast",
      })
    }

    return data
  }

  const generateCustomerSatisfactionData = () => {
    return [
      { name: "Very Satisfied", value: 45 },
      { name: "Satisfied", value: 30 },
      { name: "Neutral", value: 15 },
      { name: "Dissatisfied", value: 7 },
      { name: "Very Dissatisfied", value: 3 },
    ]
  }

  const generateSeasonalTrendsData = () => {
    const data = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 0; i < 12; i++) {
      // Wedding venues peak in spring and fall
      const weddingFactor = (i >= 2 && i <= 4) || (i >= 8 && i <= 10) ? 1.5 : 0.7

      // Conferences more consistent but dip in summer
      const conferenceFactor = i >= 5 && i <= 7 ? 0.6 : 1.2

      // Parties peak in summer and December
      const partyFactor = (i >= 5 && i <= 7) || i === 11 ? 1.8 : 0.8

      data.push({
        name: months[i],
        Wedding: Math.floor((Math.random() * 100 + 100) * weddingFactor),
        Conference: Math.floor((Math.random() * 80 + 70) * conferenceFactor),
        Party: Math.floor((Math.random() * 60 + 50) * partyFactor),
      })
    }

    return data
  }

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!chartData.revenueData || !chartData.bookingsData) return null

    const totalRevenue = chartData.revenueData.reduce((sum, item) => sum + item.revenue, 0)
    const totalBookings = chartData.bookingsData.reduce(
      (sum, item) => sum + item.completed + item.cancelled + item.pending,
      0,
    )

    // Calculate percentage changes (simulated)
    const revenueChange = Math.floor(Math.random() * 30) - 10 // -10% to +20%
    const bookingsChange = Math.floor(Math.random() * 25) - 5 // -5% to +20%

    return {
      totalRevenue,
      totalBookings,
      revenueChange,
      bookingsChange,
      avgBookingValue: totalRevenue / totalBookings,
      topCategory: chartData.categoryData[0].name,
      conversionRate: Math.floor(Math.random() * 15) + 25, // 25-40%
      customerRetention: Math.floor(Math.random() * 20) + 60, // 60-80%
    }
  }

  const summaryMetrics = !isLoading ? calculateSummaryMetrics() : null

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setIsLoading(true)
    // In a real app, this would trigger a new data fetch with the filters
    setTimeout(() => {
      setIsLoading(false)
      setShowAdvancedFilters(false)
    }, 800)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "all",
      region: "all",
      minBookings: "",
      minRevenue: "",
    })
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowAdvancedFilters(false)
    }, 800)
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Print report
  const printReport = () => {
    window.print()
  }

  // Share report
  const shareReport = () => {
    // In a real app, this would generate a shareable link or open a share dialog
    alert("Share functionality would be implemented here")
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
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={printReport}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={shareReport}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Venue Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="wedding">Wedding</option>
                <option value="conference">Conference</option>
                <option value="party">Party</option>
                <option value="banquet">Banquet</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Regions</option>
                <option value="kathmandu">Kathmandu</option>
                <option value="pokhara">Pokhara</option>
                <option value="lalitpur">Lalitpur</option>
                <option value="bhaktapur">Bhaktapur</option>
                <option value="biratnagar">Biratnagar</option>
                <option value="birgunj">Birgunj</option>
              </select>
            </div>
            <div>
              <label htmlFor="minBookings" className="block text-sm font-medium text-gray-700 mb-1">
                Min. Bookings
              </label>
              <input
                type="number"
                id="minBookings"
                name="minBookings"
                value={filters.minBookings}
                onChange={handleFilterChange}
                placeholder="e.g. 50"
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="minRevenue" className="block text-sm font-medium text-gray-700 mb-1">
                Min. Revenue (₹)
              </label>
              <input
                type="number"
                id="minRevenue"
                name="minRevenue"
                value={filters.minRevenue}
                onChange={handleFilterChange}
                placeholder="e.g. 100000"
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Report Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("overview")}
            className={`${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange("revenue")}
            className={`${
              activeTab === "revenue"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Revenue Analysis
          </button>
          <button
            onClick={() => handleTabChange("venues")}
            className={`${
              activeTab === "venues"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Venue Performance
          </button>
          <button
            onClick={() => handleTabChange("customers")}
            className={`${
              activeTab === "customers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Customer Insights
          </button>
          <button
            onClick={() => handleTabChange("forecast")}
            className={`${
              activeTab === "forecast"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Forecasting
          </button>
        </nav>
      </div>

      {isLoading ? (
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
            <div className="mt-4 flex items-center">
              {summaryMetrics.revenueChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${summaryMetrics.revenueChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {summaryMetrics.revenueChange > 0 ? "+" : ""}
                {summaryMetrics.revenueChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. previous period</span>
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
            <div className="mt-4 flex items-center">
              {summaryMetrics.bookingsChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${summaryMetrics.bookingsChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {summaryMetrics.bookingsChange > 0 ? "+" : ""}
                {summaryMetrics.bookingsChange}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. previous period</span>
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
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500">Per booking average</span>
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
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500">Based on booking volume</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Revenue Overview</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.bookingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Venue Categories</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Hourly Booking Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Hourly Booking Distribution</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.hourlyBookingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, "Bookings"]} labelFormatter={(hour) => `${hour}:00`} />
                    <Line type="monotone" dataKey="bookings" stroke="#82ca9d" activeDot={{ r: 8 }} name="Bookings" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Regional Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Regional Distribution</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={chartData.regionData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
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
                        Bookings
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
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chartData.venuePerformanceData.map((venue, index) => (
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
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">{venue.rating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(venue.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${(venue.bookings / 250) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Acquisition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">User Acquisition</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.userAcquisitionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.userAcquisitionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"][index % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Time Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Booking Time Distribution</h2>
                <button className="text-gray-400 hover:text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="animate-pulse flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-64 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <React.Fragment key={hour}>
                      {hour % 6 === 0 && (
                        <div className="col-span-1 text-right text-xs text-gray-500">
                          {hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                      )}
                      {hour % 6 !== 0 && <div className="col-span-1"></div>}
                      {[...Array(7)].map((_, day) => {
                        const value = Math.floor(Math.random() * 10)
                        let bgColor = "bg-green-100"
                        if (value > 7) bgColor = "bg-green-500"
                        else if (value > 5) bgColor = "bg-green-400"
                        else if (value > 3) bgColor = "bg-green-300"
                        else if (value > 1) bgColor = "bg-green-200"

                        return (
                          <div
                            key={`${hour}-${day}`}
                            className={`h-4 rounded ${bgColor} hover:opacity-75 cursor-pointer`}
                            title={`${
                              day === 0
                                ? "Monday"
                                : day === 1
                                  ? "Tuesday"
                                  : day === 2
                                    ? "Wednesday"
                                    : day === 3
                                      ? "Thursday"
                                      : day === 4
                                        ? "Friday"
                                        : day === 5
                                          ? "Saturday"
                                          : "Sunday"
                            } 
                                    at ${hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}: ${value} bookings`}
                          ></div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">0-1</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-200 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">2-3</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-300 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">4-5</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-400 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">6-7</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">8+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "forecast" && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Revenue Forecast</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Confidence Level:</span>
              <select className="text-sm border rounded p-1">
                <option>95%</option>
                <option>90%</option>
                <option>80%</option>
              </select>
            </div>
          </div>
          {isLoading ? (
            <div className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-80 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData.forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="actual" fill="#8884d8" stroke="#8884d8" name="Actual Revenue" />
                <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" strokeWidth={2} />
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  fill="#82ca9d"
                  fillOpacity={0.1}
                  stroke="none"
                  name="Optimistic Scenario"
                />
                <Area
                  type="monotone"
                  dataKey="pessimistic"
                  fill="#82ca9d"
                  fillOpacity={0.1}
                  stroke="none"
                  name="Pessimistic Scenario"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Forecast Insights</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Based on current trends, we project a 15% increase in revenue over the next 6 months. The wedding
                  season in Q3 is expected to drive significant growth, with potential for 22% higher bookings compared
                  to the same period last year.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Revenue Report</h3>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Detailed revenue breakdown by venue, category, and time period</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Booking Analytics</h3>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Complete booking data with status, customer info, and venue details</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Venue Performance</h3>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Performance metrics for all venues including ratings and revenue</p>
          </div>
        </div>
      </div>
    </div>
  )
}

