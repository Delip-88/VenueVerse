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
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get payment status badge styling
  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  // Export bookings to CSV
  const exportToCSV = () => {
    const filteredBookings = getFilteredBookings()
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export")
      return
    }

    // Create CSV content
    const headers = ["Date", "Time", "Venue", "Customer", "Status", "Payment", "Amount"]
    const csvContent = [
      headers.join(","),
      ...filteredBookings.map((booking) =>
        [
          booking.date,
          `${booking.timeslots[0]?.start || "N/A"} - ${booking.timeslots[0]?.end || "N/A"}`,
          booking.venueName,
          booking.user?.name || "N/A",
          booking.bookingStatus,
          booking.paymentStatus,
          booking.totalPrice,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings_${selectedTab}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Bookings exported successfully")
  }

  // Print bookings
  const printBookings = () => {
    window.print()
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <p className="text-gray-600 mt-1">Track and manage all your venue bookings in one place</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={printBookings}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingCount}</p>
            </div>
            <CalendarClock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{pastCount}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by customer or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setSelectedTab("upcoming")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              selectedTab === "upcoming"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CalendarClock className="w-5 h-5 mr-2" />
            <span>Upcoming ({upcomingCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("today")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              selectedTab === "today"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            <span>Today ({todayCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("past")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              selectedTab === "past"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            <span>Past ({pastCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("cancelled")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              selectedTab === "cancelled"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CalendarX className="w-5 h-5 mr-2" />
            <span>Cancelled ({cancelledCount})</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {getTabIcon(selectedTab)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No {selectedTab} bookings found</h3>
            <p className="text-gray-500">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  {selectedTab === "upcoming" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Countdown
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        {booking.venueImage ? (
                          <img
                            src={booking.venueImage || "/placeholder.svg"}
                            alt={booking.venueName}
                            className="w-10 h-10 rounded-md object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                            <MapPin className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{booking.venueName}</div>
                          <div className="text-sm text-gray-500">
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
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(booking.paymentStatus)}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Rs. {booking.totalPrice}</td>
                    {selectedTab === "upcoming" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm">{getTimeRemaining(booking.date)}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking)
                          setIsDetailsModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  setSelectedBooking(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Venue Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    {selectedBooking.venueImage ? (
                      <img
                        src={selectedBooking.venueImage || "/placeholder.svg"}
                        alt={selectedBooking.venueName}
                        className="w-12 h-12 rounded-md object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                        <MapPin className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{selectedBooking.venueName}</div>
                      <div className="text-sm text-gray-500">
                        {selectedBooking.venueLocation?.city}, {selectedBooking.venueLocation?.province}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{formatDate(selectedBooking.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span>
                        {selectedBooking.timeslots[0]?.start} - {selectedBooking.timeslots[0]?.end}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span>
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
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Name:</span>
                      <p className="font-medium">{selectedBooking.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Email:</span>
                      <p className="font-medium">{selectedBooking.user?.email || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Phone:</span>
                      <p className="font-medium">{selectedBooking.user?.phone || "N/A"}</p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleContactCustomer("email", selectedBooking.user?.email)}
                        disabled={!selectedBooking.user?.email}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>

                      <button
                        onClick={() => handleContactCustomer("phone", selectedBooking.user?.phone)}
                        disabled={!selectedBooking.user?.phone}
                        className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Booking Status</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Booking Status:</span>
                    <p
                      className={`mt-1 font-medium ${getStatusBadge(selectedBooking.bookingStatus)} inline-block px-2 py-1 rounded-full text-sm`}
                    >
                      {selectedBooking.bookingStatus}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Payment Status:</span>
                    <p
                      className={`mt-1 font-medium ${getPaymentBadge(selectedBooking.paymentStatus)} inline-block px-2 py-1 rounded-full text-sm`}
                    >
                      {selectedBooking.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Amount:</span>
                  <p className="text-xl font-bold">Rs. {selectedBooking.totalPrice}</p>
                </div>

                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">Additional Services:</span>
                    <div className="mt-2 space-y-2">
                      {selectedBooking.selectedServices.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>Rs. {service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                {selectedTab === "upcoming" && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    <span>Coming up in {getTimeRemaining(selectedBooking.date)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`/venue/${selectedBooking.venueId}`, "_blank")}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Venue
                </button>

                {selectedBooking.bookingStatus === "PENDING" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "APPROVED")}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}

                {(selectedBooking.bookingStatus === "PENDING" || selectedBooking.bookingStatus === "APPROVED") && (
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "CANCELLED")}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Bookings are automatically approved when payment is received. You can also manually approve or cancel
              bookings as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageBookings

