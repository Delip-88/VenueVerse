
"use client"

import { useState } from "react"
import { MapPin, Users, Star, Building2, Phone, Mail, DollarSign, CheckCircle2, XCircle } from "lucide-react"

// Sample data - replace with your actual data fetching logic
const venueData = {
  id: "v1",
  name: "Grand Conference Center",
  description:
    "A luxurious conference center with modern amenities, perfect for corporate events, seminars, and large gatherings.",
  image: "https://res.cloudinary.com/dduky37gb/image/upload/v1740127136/VenueVerse/venues/svbbysrakec9salwl8ex.png",
  location: {
    street: "123 Business Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  capacity: 500,
  pricePerHour: 299,
  facilities: ["Wi-Fi", "Parking", "Catering", "AV Equipment", "Stage", "Security"],
  contactInfo: {
    phone: "+1 (555) 123-4567",
    email: "bookings@grandconference.com",
  },
  rating: 4.8,
  totalBookings: 156,
  completedBookings: 142,
  upcomingBookings: [
    {
      id: "b1",
      customerName: "John Smith",
      eventType: "Corporate Conference",
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "17:00",
      attendees: 300,
      status: "confirmed",
      totalAmount: 2392,
    },
    {
      id: "b2",
      customerName: "Sarah Johnson",
      eventType: "Wedding Reception",
      date: "2024-03-20",
      startTime: "14:00",
      endTime: "22:00",
      attendees: 200,
      status: "pending",
      totalAmount: 1794,
    },
  ],
}

export default function VenueDetails() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBooking, setSelectedBooking] = useState(null)

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Building2 className="h-5 w-5 mr-3" />
              <span>Venue Type: Conference Center</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3" />
              <span>Maximum Capacity: {venueData.capacity} people</span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-5 w-5 mr-3" />
              <span>Price: ${venueData.pricePerHour}/hour</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span>
                {venueData.location.street}, {venueData.location.city}, {venueData.location.state}{" "}
                {venueData.location.zipCode}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Phone className="h-5 w-5 mr-3" />
              <span>{venueData.contactInfo.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-5 w-5 mr-3" />
              <span>{venueData.contactInfo.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Facilities & Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {venueData.facilities.map((facility) => (
              <div key={facility} className="flex items-center text-gray-600">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 text-2xl font-bold">{venueData.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-2xl font-bold">{venueData.completedBookings}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-yellow-600 text-2xl font-bold">{venueData.upcomingBookings.length}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 text-2xl font-bold">{venueData.rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-gray-600">{venueData.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Update Details
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Manage Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBookingsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export Bookings
            </button>
            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Add Booking
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venueData.upcomingBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.eventType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${booking.totalAmount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{venueData.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-600">
                  {venueData.location.city}, {venueData.location.state}
                </span>
                <span className="mx-2">•</span>
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-gray-600">{venueData.rating} Rating</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Edit Venue
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <img
            src={venueData.image || "/placeholder.svg"}
            alt={venueData.name}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
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
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-blue-500 text-blue-600"
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
                <h3 className="text-lg font-semibold">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-500">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="mt-1">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Type</label>
                  <p className="mt-1">{selectedBooking.eventType}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="mt-1">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time</label>
                    <p className="mt-1">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Attendees</label>
                    <p className="mt-1">{selectedBooking.attendees}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1">${selectedBooking.totalAmount}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span
                    className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedBooking.status,
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

