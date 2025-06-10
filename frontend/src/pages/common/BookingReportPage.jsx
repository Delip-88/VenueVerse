

import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import BookingReport from "./Report"

export default function BookingReportPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Get booking data from navigation state
  const { booking, companyInfo } = location.state || {}

  // If no booking data, redirect back
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No booking data found</h2>
          <p className="text-gray-600 mb-4">Please select a booking to generate a report.</p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate("/my-bookings")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Bookings
          </button>
        </div>
      </div>

      {/* Booking Report */}
      <div className="py-8">
        <BookingReport booking={booking} companyInfo={companyInfo} />
      </div>
    </div>
  )
}
