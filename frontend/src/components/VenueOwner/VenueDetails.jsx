"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  MapPin,
  Users,
  Star,
  Building2,
  Phone,
  Mail,
  DollarSign,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  Share2,
  Printer,
  Download,
  AlertCircle,
  Loader,
  Tag,
  Info,
  ServerIcon,
  IndianRupee,
} from "lucide-react"
import { useQuery } from "@apollo/client"
import { VENUE_BY_ID } from "../Graphql/query/venuesGql"
import { formatDate } from "../Functions/calc"

export default function VenueDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch venue data
  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only", // Ensure we get fresh data
  })

  // Calculate metrics
  const calculateMetrics = (venue) => {
    if (!venue) return {}

    const totalBookings = venue.bookings?.length || 0
    const completedBookings = venue.bookings?.filter((b) => b.bookingStatus === "APPROVED").length || 0
    const upcomingBookings =
      venue.bookings?.filter((b) => ["PENDING", "APPROVED"].includes(b.bookingStatus) && new Date(b.date) >= new Date())
        .length || 0

    const averageRating =
      venue.reviews?.length > 0
        ? (venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
        : "N/A"

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      averageRating,
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return "bg-teal-100 text-teal-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCategory = (category) => {
    if (!category) return "Venue"
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleExportBookings = () => {
    if (!data?.venue?.bookings) return

    // Create CSV content
    const headers = ["Customer", "Date", "Time", "Status", "Amount"]
    const csvContent = [
      headers.join(","),
      ...data.venue.bookings.map((booking) =>
        [
          booking.user?.name || "N/A",
          booking.date,
          `${booking.timeslots[0]?.start || "N/A"} - ${booking.timeslots[0]?.end || "N/A"}`,
          booking.bookingStatus,
          booking.totalPrice,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${data.venue.name}_bookings.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  const renderOverviewTab = () => {
    if (!data?.venue) return null
    const venue = data.venue
    const metrics = calculateMetrics(venue)

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              About This Venue
            </h3>
            <p className="text-gray-700 leading-relaxed">{venue.description}</p>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Venue Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Tag className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Venue Type</span>
                    <span className="font-medium">
                      {venue.categories?.map(formatCategory).join(", ") || formatCategory(venue.category) || "Venue"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Maximum Capacity</span>
                    <span className="font-medium">{venue.capacity} people</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <IndianRupee className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Base Price</span>
                    <span className="font-medium">Rs. {venue.basePricePerHour}/hour</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Location</span>
                    <span className="font-medium">
                      {venue.location.street}, {venue.location.city}, {venue.location.province}
                      {venue.location.zipCode ? ` ${venue.location.zipCode}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          {venue.services && venue.services.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
                <ServerIcon className="h-5 w-5 mr-2" />
                Available Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {venue.services.map((service) => (
                  <div
                    key={service.serviceId.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center">
                      {service.serviceId.image?.secure_url ? (
                        <img
                          src={service.serviceId.image.secure_url || "/placeholder.svg"}
                          alt={service.serviceId.name}
                          className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-teal-100 rounded-md flex items-center justify-center mr-3">
                          <Tag className="h-5 w-5 text-teal-600" />
                        </div>
                      )}
                      <span className="text-gray-800">{service.serviceId.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-teal-700">Rs. {service.servicePrice}</span>
                      {service.category && (
                        <span className="block text-xs text-gray-500">
                          {service.category === "hourly" ? "per hour" : "fixed price"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {venue.reviews && venue.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Customer Reviews
              </h3>
              <div className="space-y-4">
                {venue.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{review.user?.name || "Anonymous"}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-4">
              {venue.owner?.name && (
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Owner</span>
                    <span className="font-medium">{venue.owner.name}</span>
                  </div>
                </div>
              )}
              {venue.owner?.email && (
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Email</span>
                    <a href={`mailto:${venue.owner.email}`} className="font-medium text-teal-600 hover:underline">
                      {venue.owner.email}
                    </a>
                  </div>
                </div>
              )}
              {venue.owner?.phone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-3 text-teal-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Phone</span>
                    <a href={`tel:${venue.owner.phone}`} className="font-medium text-teal-600 hover:underline">
                      {venue.owner.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <div className="text-teal-600 text-2xl font-bold">{metrics.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-green-600 text-2xl font-bold">{metrics.completedBookings}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-yellow-600 text-2xl font-bold">{metrics.upcomingBookings}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <div className="text-teal-600 text-2xl font-bold">{metrics.averageRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-teal-700">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/Dashboard/edit-venue/${venue.id}`)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Update Details
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className="w-full px-4 py-2 bg-teal-100 text-teal-800 rounded-md hover:bg-teal-200 transition-colors flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Manage Bookings
              </button>
              <button
                onClick={() => window.open(`/venue/${venue.id}`, "_blank")}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Preview Public Page
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderBookingsTab = () => {
    if (!data?.venue) return null
    const venue = data.venue

    // Sort bookings by date (most recent first) and filter by status if needed
    const filteredBookings = [...(venue.bookings || [])]
      .filter((booking) => {
        if (statusFilter === "all") return true
        return booking.bookingStatus?.toLowerCase() === statusFilter.toLowerCase()
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-teal-700 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking History
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportBookings}
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </button>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-sm font-medium text-teal-700">Filter by status:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === "all"
                        ? "bg-teal-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter("approved")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === "approved"
                        ? "bg-teal-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setStatusFilter("cancelled")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === "cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Cancelled
                  </button>
                  <button
                    onClick={() => setStatusFilter("completed")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === "completed"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-900 mb-2">
                {venue.bookings && venue.bookings.length > 0
                  ? "No bookings match the selected filter"
                  : "No Bookings Yet"}
              </h4>
              <p className="text-gray-500 max-w-md mx-auto">
                {venue.bookings && venue.bookings.length > 0
                  ? "Try changing your filter to see other bookings"
                  : "This venue doesn't have any bookings yet. When customers book your venue, their reservations will appear here."}
              </p>
              {venue.bookings && venue.bookings.length > 0 && statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="mt-4 px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Show All Bookings
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-teal-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.timeslots && booking.timeslots[0]
                            ? `${booking.timeslots[0].start} - ${booking.timeslots[0].end}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus)}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Rs. {booking.totalPrice}</div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Venue</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Return to My Venues
          </button>
        </div>
      </div>
    )
  }

  if (!data?.venue) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Return to My Venues
          </button>
        </div>
      </div>
    )
  }

  const venue = data.venue

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="flex items-center text-teal-600 hover:text-teal-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Venues
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg shadow mb-6 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{venue.name}</h1>
              <div className="flex items-center mt-2 text-teal-100">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {venue.location.city}, {venue.location.province}
                </span>
                {venue.reviews && venue.reviews.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <Star className="h-4 w-4 text-yellow-300 mr-1" />
                    <span>
                      {(venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(
                        1,
                      )}{" "}
                      Rating
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                onClick={() => navigate(`/Dashboard/edit-venue/${venue.id}`)}
                className="px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-teal-50 transition-colors"
              >
                Edit Venue
              </button>
              <button
                onClick={() => window.open(`/venue/${venue.id}`, "_blank")}
                className="px-4 py-2 bg-teal-700 bg-opacity-30 text-white border border-teal-300 rounded-md hover:bg-opacity-50 transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <img
            src={venue.image?.secure_url || "/placeholder.svg?height=400&width=800"}
            alt={venue.name}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">{activeTab === "overview" ? renderOverviewTab() : renderBookingsTab()}</div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-teal-700">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-500">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="mt-1 font-medium">{selectedBooking.user?.name || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="mt-1 font-medium">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time</label>
                    <p className="mt-1 font-medium">
                      {selectedBooking.timeslots && selectedBooking.timeslots[0]
                        ? `${selectedBooking.timeslots[0].start} - ${selectedBooking.timeslots[0].end}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Status</label>
                    <p className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.bookingStatus)}`}
                      >
                        {selectedBooking.bookingStatus}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <p className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.paymentStatus)}`}
                      >
                        {selectedBooking.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-lg font-semibold text-teal-700">Rs. {selectedBooking.totalPrice}</p>
                </div>
                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Selected Services</label>
                    <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-md">
                      {selectedBooking.selectedServices.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="font-medium">Rs. {service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedBooking.bookingStatus === "PENDING" && (
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                    Approve Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
