"use client"

import { useContext, useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  ChevronDown,
  MapPin,
  CheckCircle,
  Filter,
  Search,
  X,
  Bell,
  CheckSquare,
  XCircle,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Printer,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Users,
  DollarSign,
  Activity,
  Eye,
  Package,
} from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { MY_VENUES } from "../Graphql/query/meGql"
import { formatDate } from "../Functions/calc"
import toast from "react-hot-toast"

// Assuming you have a mutation for updating booking status
// import { UPDATE_BOOKING_STATUS } from "../Graphql/mutations/bookingGql"

const ManageBookings = () => {
  const { loading: authLoading } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const { data, loading: venueLoading, error, refetch } = useQuery(MY_VENUES)

  // Uncomment when you have the mutation
  // const [updateBookingStatus, { loading: updateLoading }] = useMutation(UPDATE_BOOKING_STATUS)

  // Process bookings data
  const [bookings, setBookings] = useState({
    upcoming: [],
    today: [],
    past: [],
    cancelled: [],
  })

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues)
      processBookings(data.myVenues)
    }
  }, [data])

  // Process and categorize bookings
  const processBookings = (venueData) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let allBookings = []

    // Collect all bookings from all venues
    venueData.forEach((venue) => {
      if (venue.bookings && venue.bookings.length > 0) {
        const venueBookings = venue.bookings.map((booking) => ({
          ...booking,
          venueName: venue.name,
          venueId: venue.id,
          venueLocation: venue.location,
          venueImage: venue.image?.secure_url,
        }))
        allBookings = [...allBookings, ...venueBookings]
      }
    })

    // Sort bookings by date (newest first for past, oldest first for upcoming)
    allBookings.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Categorize bookings
    const categorized = {
      upcoming: [],
      today: [],
      past: [],
      cancelled: [],
    }

    allBookings.forEach((booking) => {
      const bookingDate = new Date(booking.date)

      // Check if booking is cancelled
      if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REJECTED") {
        categorized.cancelled.push(booking)
        return
      }

      // Check if booking is today
      if (bookingDate >= today && bookingDate < tomorrow) {
        categorized.today.push(booking)
        return
      }

      // Check if booking is in the past
      if (bookingDate < today) {
        categorized.past.push(booking)
        return
      }

      // Otherwise it's upcoming
      categorized.upcoming.push(booking)
    })

    // Sort upcoming by date (closest first)
    categorized.upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Sort today by time
    categorized.today.sort((a, b) => {
      const timeA = a.timeslots[0]?.start || "00:00"
      const timeB = b.timeslots[0]?.start || "00:00"
      return timeA.localeCompare(timeB)
    })

    // Sort past by date (most recent first)
    categorized.past.sort((a, b) => new Date(b.date) - new Date(a.date))

    setBookings(categorized)
  }

  // Filter bookings based on selected venue, search term, and status
  const getFilteredBookings = () => {
    let filtered = bookings[selectedTab] || []

    // Filter by venue
    if (selectedVenue !== "all") {
      filtered = filtered.filter((booking) => booking.venueId === selectedVenue)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.bookingStatus === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.user?.name?.toLowerCase().includes(term) ||
          booking.venueName?.toLowerCase().includes(term) ||
          booking.venueLocation?.city?.toLowerCase().includes(term),
      )
    }

    return filtered
  }

  // Calculate time remaining for upcoming bookings
  const getTimeRemaining = (dateString) => {
    const bookingDate = new Date(dateString)
    const now = new Date()

    const diffTime = bookingDate - now
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hr${diffHours !== 1 ? "s" : ""}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
    } else {
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`
    }
  }

  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Uncomment when you have the mutation
      /*
      await updateBookingStatus({
        variables: {
          bookingId,
          status: newStatus
        }
      })
      */

      // For now, just show a toast and close the modal
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`)
      setIsDetailsModalOpen(false)
      setSelectedBooking(null)

      // Refetch data to update the UI
      refetch()
    } catch (error) {
      toast.error(`Failed to update booking: ${error.message}`)
    }
  }

  // Handle contact customer
  const handleContactCustomer = (method, contact) => {
    if (method === "email" && contact) {
      window.location.href = `mailto:${contact}`
    } else if (method === "phone" && contact) {
      window.location.href = `tel:${contact}`
    } else {
      toast.error("Contact information not available")
    }
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      case "PENDING":
        return "bg-amber-100 text-amber-800 border border-amber-200"
      case "COMPLETED":
        return "bg-teal-100 text-teal-800 border border-teal-200"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  // Get payment status badge styling
  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      case "PENDING":
        return "bg-amber-100 text-amber-800 border border-amber-200"
      case "REFUNDED":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  // Get tab icon
  const getTabIcon = (tab) => {
    switch (tab) {
      case "upcoming":
        return <CalendarClock className="w-5 h-5" />
      case "today":
        return <Calendar className="w-5 h-5" />
      case "past":
        return <CalendarCheck className="w-5 h-5" />
      case "cancelled":
        return <CalendarX className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }


  // Calculate services total
  const calculateServicesTotal = (selectedServices) => {
    if (!selectedServices || selectedServices.length === 0) return 0
    return selectedServices.reduce((total, service) => total + (service.servicePrice || 0), 0)
  }

  if (authLoading || venueLoading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  const filteredBookings = getFilteredBookings()
  const totalBookings = Object.values(bookings).flat().length
  const todayCount = bookings.today.length
  const upcomingCount = bookings.upcoming.length
  const pastCount = bookings.past.length
  const cancelledCount = bookings.cancelled.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <Activity className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                <p className="text-gray-600 mt-1">Track and manage all your venue bookings in one place</p>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                <p className="text-xs text-gray-500 mt-1">All time bookings</p>
              </div>
              <div className="bg-teal-100 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
              </div>
              <div className="bg-amber-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                <p className="text-xs text-gray-500 mt-1">Future bookings</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <CalendarClock className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{pastCount}</p>
                <p className="text-xs text-gray-500 mt-1">Past events</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <CheckSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by customer name, venue, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="appearance-none pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors min-w-[160px]"
                >
                  <option value="all">All Venues</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors font-medium ${
                  isFilterOpen
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Filter className="h-5 w-5" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setStatusFilter("all")
                    setSearchTerm("")
                    setSelectedVenue("all")
                    setIsFilterOpen(false)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedTab("upcoming")}
              className={`flex items-center px-6 py-4 border-b-2 transition-colors font-medium ${
                selectedTab === "upcoming"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CalendarClock className="w-5 h-5 mr-2" />
              <span>Upcoming ({upcomingCount})</span>
            </button>

            <button
              onClick={() => setSelectedTab("today")}
              className={`flex items-center px-6 py-4 border-b-2 transition-colors font-medium ${
                selectedTab === "today"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              <span>Today ({todayCount})</span>
            </button>

            <button
              onClick={() => setSelectedTab("past")}
              className={`flex items-center px-6 py-4 border-b-2 transition-colors font-medium ${
                selectedTab === "past"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              <span>Past ({pastCount})</span>
            </button>

            <button
              onClick={() => setSelectedTab("cancelled")}
              className={`flex items-center px-6 py-4 border-b-2 transition-colors font-medium ${
                selectedTab === "cancelled"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CalendarX className="w-5 h-5 mr-2" />
              <span>Cancelled ({cancelledCount})</span>
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                {getTabIcon(selectedTab)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {selectedTab} bookings found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {selectedTab === "upcoming" && "You don't have any upcoming bookings."}
                {selectedTab === "today" && "You don't have any bookings scheduled for today."}
                {selectedTab === "past" && "You don't have any past bookings."}
                {selectedTab === "cancelled" && "You don't have any cancelled bookings."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    {selectedTab === "upcoming" && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Countdown
                      </th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          {booking.venueImage ? (
                            <img
                              src={booking.venueImage || "/placeholder.svg"}
                              alt={booking.venueName}
                              className="w-12 h-12 rounded-lg object-cover mr-4 border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4 border border-gray-200">
                              <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{booking.venueName}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(booking.date)} • {booking.timeslots[0]?.start} - {booking.timeslots[0]?.end}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{booking.user?.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.bookingStatus)}`}
                          >
                            {booking.bookingStatus}
                          </span>
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(booking.paymentStatus)}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Rs. {booking.totalPrice}
                      </td>
                      {selectedTab === "upcoming" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-teal-500 mr-2" />
                            <span className="text-sm font-medium">{getTimeRemaining(booking.date)}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsDetailsModalOpen(true)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div
              className="bg-white rounded-xl max-w-4xl w-full shadow-xl border border-gray-200"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false)
                      setSelectedBooking(null)
                    }}
                    className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                      Venue Information
                    </h4>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center mb-4">
                        {selectedBooking.venueImage ? (
                          <img
                            src={selectedBooking.venueImage || "/placeholder.svg"}
                            alt={selectedBooking.venueName}
                            className="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center mr-4 border border-gray-200">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{selectedBooking.venueName}</div>
                          <div className="text-sm text-gray-600">
                            {selectedBooking.venueLocation?.city}, {selectedBooking.venueLocation?.province}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(selectedBooking.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {selectedBooking.timeslots[0]?.start} - {selectedBooking.timeslots[0]?.end}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {(() => {
                              const start = selectedBooking.timeslots[0]?.start || "00:00"
                              const end = selectedBooking.timeslots[0]?.end || "00:00"
                              const [startHour, startMin] = start.split(":").map(Number)
                              const [endHour, endMin] = end.split(":").map(Number)
                              const startMinutes = startHour * 60 + startMin
                              const endMinutes = endHour * 60 + endMin
                              const durationMinutes = endMinutes - startMinutes
                              const hours = Math.floor(durationMinutes / 60)
                              const minutes = durationMinutes % 60
                              return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`
                            })()}
                          </span>
                        </div>
                        {/* Event Type */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Event Type:</span>
                          <span className="font-medium">{selectedBooking.eventType || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-teal-600" />
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600 text-sm">Name:</span>
                          <p className="font-semibold text-gray-900">{selectedBooking.user?.name || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm">Email:</span>
                          <p className="font-semibold text-gray-900">{selectedBooking.user?.email || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm">Phone:</span>
                          <p className="font-semibold text-gray-900">
                            {selectedBooking.phone || selectedBooking.user?.phone || "N/A"}
                          </p>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleContactCustomer("email", selectedBooking.user?.email)}
                            disabled={!selectedBooking.user?.email}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </button>

                          <button
                            onClick={() =>
                              handleContactCustomer("phone", selectedBooking.phone || selectedBooking.user?.phone)
                            }
                            disabled={!selectedBooking.phone && !selectedBooking.user?.phone}
                            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Services Section */}
                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-teal-600" />
                      Selected Services
                    </h4>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="space-y-3">
                        {selectedBooking.selectedServices.map((service, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {service.serviceId?.name || "Unknown Service"}
                              </span>
                              <p className="text-sm text-gray-500">Service ID: {service.serviceId?.id}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900">Rs. {service.servicePrice || 0}</span>
                            </div>
                          </div>
                        ))}

                        {/* Services Total */}
                        <div className="border-t border-gray-200 pt-3 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Services Total:</span>
                            <span className="font-bold text-teal-600">
                              Rs. {calculateServicesTotal(selectedBooking.selectedServices)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
                    Booking Status & Payment
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-600 text-sm">Booking Status:</span>
                        <p
                          className={`mt-2 font-semibold ${getStatusBadge(selectedBooking.bookingStatus)} inline-block px-3 py-1 rounded-full text-sm`}
                        >
                          {selectedBooking.bookingStatus}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 text-sm">Payment Status:</span>
                        <p
                          className={`mt-2 font-semibold ${getPaymentBadge(selectedBooking.paymentStatus)} inline-block px-3 py-1 rounded-full text-sm`}
                        >
                          {selectedBooking.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className="text-gray-600 text-sm">Total Amount:</span>
                      <p className="text-2xl font-bold text-gray-900">Rs. {selectedBooking.totalPrice}</p>
                    </div>

                    {/* Attendees */}
                    {selectedBooking.attendees && (
                      <div className="mt-6">
                        <span className="text-gray-600 text-sm">Number of Attendees:</span>
                        <span className="ml-3 font-semibold text-gray-900">{selectedBooking.attendees}</span>
                      </div>
                    )}

                    {/* Additional Notes */}
                    {selectedBooking.additionalNotes && (
                      <div className="mt-6">
                        <span className="text-gray-600 text-sm">Additional Notes:</span>
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                          {selectedBooking.additionalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    {selectedTab === "upcoming" && (
                      <div className="flex items-center text-sm text-gray-600 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200">
                        <Clock className="w-4 h-4 mr-2 text-teal-600" />
                        <span>Coming up in {getTimeRemaining(selectedBooking.date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open(`/venue/${selectedBooking.venueId}`, "_blank")}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Venue
                    </button>

                    {selectedBooking.bookingStatus === "PENDING" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedBooking.id, "APPROVED")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}

                    {(selectedBooking.bookingStatus === "PENDING" || selectedBooking.bookingStatus === "APPROVED") && (
                      <button
                        onClick={() => handleStatusUpdate(selectedBooking.id, "CANCELLED")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mt-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-teal-800">Booking Management Tips</h3>
              <p className="text-sm text-teal-700 mt-1">
                Bookings are automatically approved when payment is received. You can also manually approve or cancel
                bookings as needed. Use the export feature to download booking data for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageBookings
