"use client"
import { useQuery } from "@apollo/client"
import { useParams } from "react-router-dom"
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  FileText,
  PrinterIcon as Print,
  Users,
} from "lucide-react"
import { MY_BOOKINGS } from "../../components/Graphql/query/meGql"

export default function BookingReport({ companyInfo: propCompanyInfo }) {
  const { id: bookingID } = useParams()
  const { data, loading, error } = useQuery(MY_BOOKINGS, {
    variables: { id: bookingID },
  })

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-600">Error loading booking report.</div>
  if (!data || !data.booking) return <div className="p-8 text-center">No booking found.</div>

  const booking = data.booking

  // Default company info if not provided
  const companyInfo = propCompanyInfo || {
    name: "VenueVerse",
    address: "123 Business Street, City, State 12345",
    phone: "9865502032",
    email: "contact@venueVerse.com",
    website: "www.venueVerse.com",
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateDuration = () => {
    if (!booking.timeslots || booking.timeslots.length === 0) return 0
    const startTime = booking.timeslots[0].start
    const endTime = booking.timeslots[booking.timeslots.length - 1].end
    const start = new Date(`2000-01-01 ${startTime}`)
    const end = new Date(`2000-01-01 ${endTime}`)
    return (end - start) / (1000 * 60 * 60) // Convert to hours
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
      case "PAID":
        return "bg-green-100 text-green-700 border-green-300"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "REJECTED":
      case "CANCELLED":
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-300"
      case "NO_SHOW":
        return "bg-orange-100 text-orange-700 border-orange-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const formatLocation = (location) => {
    if (!location) return ""
    const parts = []
    if (location.street) parts.push(location.street)
    if (location.city) parts.push(location.city)
    if (location.province) parts.push(location.province)
    if (location.zipCode) parts.push(location.zipCode)
    return parts.join(", ")
  }

  const handlePrint = () => {
    window.print()
  }

  const duration = calculateDuration()
  const basePricePerHour = booking.venue?.basePricePerHour || 0
  const baseAmount = basePricePerHour * duration

  // --- Professional, single-page layout starts here ---
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl print:shadow-none print:rounded-none border border-gray-200 my-10">
      {/* Print Button */}
      <div className="flex justify-end p-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition"
        >
          <Print className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Summary Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-8 py-6 rounded-t-2xl">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">{companyInfo.name}</h1>
          <div className="text-gray-600 mt-1">
            <span>{companyInfo.address}</span>
            <span className="mx-2">|</span>
            <span>{companyInfo.phone}</span>
            <span className="mx-2">|</span>
            <span>{companyInfo.email}</span>
          </div>
          {companyInfo.website && (
            <div className="text-blue-700 text-sm mt-1">{companyInfo.website}</div>
          )}
        </div>
        <div className="text-right mt-4 md:mt-0">
          <div className="text-xl font-semibold text-gray-800">Booking Invoice</div>
          <div className="text-gray-500 text-sm mt-1">
            <span className="font-medium">Booking ID:</span> {booking.id}
            <br />
            <span className="font-medium">Issued:</span> {formatDate(booking.createdAt || booking.date)}
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3 px-8 py-4 border-b border-gray-100 bg-white">
        <span className={`px-4 py-1 rounded-full border text-sm font-semibold shadow-sm ${getStatusColor(booking.bookingStatus)}`}>
          Booking: {booking.bookingStatus}
        </span>
        <span className={`px-4 py-1 rounded-full border text-sm font-semibold shadow-sm ${getStatusColor(booking.paymentStatus)}`}>
          Payment: {booking.paymentStatus}
        </span>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Customer & Event Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-800">
              <User className="w-5 h-5" />
              Customer
            </h3>
            <div className="space-y-1 text-gray-700">
              <div className="font-medium text-lg">{booking.user?.name}</div>
              {booking.user?.email && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Mail className="w-4 h-4" />
                  {booking.user.email}
                </div>
              )}
              {booking.phone && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {booking.phone}
                </div>
              )}
              {booking.user?.phone && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {booking.user.phone}
                </div>
              )}
            </div>
          </div>
          {/* Event Card */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-800">
              <Calendar className="w-5 h-5" />
              Event
            </h3>
            <div className="space-y-1 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{booking.venue?.name}</span>
              </div>
              <div className="ml-6 text-gray-500 text-sm">{formatLocation(booking.venue?.location)}</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(booking.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {booking.timeslots?.[0]?.start} - {booking.timeslots?.[booking.timeslots.length - 1]?.end}
                {duration > 0 && (
                  <span className="ml-2 text-xs text-gray-500">({duration} hours)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Type:</span> {booking.eventType}
              </div>
              {booking.attendees && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Attendees:</span> {booking.attendees}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-blue-800">
            <FileText className="w-5 h-5" />
            Billing Details
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-blue-900">Description</th>
                  <th className="text-right p-4 font-semibold text-blue-900">Hours</th>
                  <th className="text-right p-4 font-semibold text-blue-900">Rate/Hour</th>
                  <th className="text-right p-4 font-semibold text-blue-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Base Venue Rental */}
                <tr>
                  <td className="p-4">
                    <div className="font-medium">Venue Rental - {booking.venue?.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(booking.date)} &bull; {booking.eventType}
                    </div>
                  </td>
                  <td className="p-4 text-right">{duration}</td>
                  <td className="p-4 text-right">{formatCurrency(basePricePerHour)}</td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(baseAmount)}</td>
                </tr>
                {/* Additional Services */}
                {booking.selectedServices?.map((service, index) => (
                  <tr key={index}>
                    <td className="p-4">
                      <div className="font-medium">{service.serviceId.name}</div>
                      <div className="text-xs text-gray-500">Service ID: {service.serviceId.id}</div>
                    </td>
                    <td className="p-4 text-right">1</td>
                    <td className="p-4 text-right">{formatCurrency(service.servicePrice)}</td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(service.servicePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Venue Rental:</span>
                <span>{formatCurrency(baseAmount)}</span>
              </div>
              {booking.selectedServices?.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <span>{service.serviceId.name}:</span>
                  <span>{formatCurrency(service.servicePrice)}</span>
                </div>
              ))}
              <div className="border-t border-blue-200 pt-3 mt-2">
                <div className="flex justify-between text-lg font-bold text-blue-900">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {booking.additionalNotes && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Additional Notes</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-700 shadow-sm">
              {booking.additionalNotes}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-8 py-6 text-center text-gray-500 rounded-b-2xl bg-white">
        <div className="mb-1 font-medium text-gray-700">
          Thank you for choosing {companyInfo.name}!
        </div>
        <div className="text-xs">
          For questions about this booking, contact us at <span className="underline">{companyInfo.email}</span> or <span className="underline">{companyInfo.phone}</span>
        </div>
      </div>
    </div>
  )
}
