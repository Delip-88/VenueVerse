import React, { useState } from "react"
import { Calendar, Clock, User, Mail, Phone, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data for available dates and slots (replace with actual data fetching)
const availableDates = [
  { date: "2025-01-26", slots: ["9:00-12:00", "13:00-16:00", "17:00-20:00"] },
  { date: "2025-01-27", slots: ["9:00-12:00", "13:00-16:00"] },
  { date: "2025-01-28", slots: ["13:00-16:00", "17:00-20:00"] },
]

const BookNowPage = () => {
  const [selectedDate, setSelectedDate] = useState(availableDates[0].date)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the booking data to your backend
    console.log("Booking submitted:", { selectedDate, selectedSlot, ...bookingDetails })
    // After successful booking, you might want to show a confirmation message or redirect the user
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Venue</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Date</h2>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSelectedDate(availableDates[0].date)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar size={24} />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {availableDates.map((date) => (
                  <option key={date.date} value={date.date}>
                    {date.date}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(availableDates[availableDates.length - 1].date)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Time Slot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableDates
              .find((d) => d.date === selectedDate)
              ?.slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex items-center justify-center py-2 px-4 rounded ${
                    selectedSlot === slot ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Clock size={16} className="mr-2" />
                  {slot}
                </button>
              ))}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                  value={bookingDetails.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                  value={bookingDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="+1 (555) 987-6543"
                  value={bookingDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="cardNumber"
                  id="cardNumber"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="1234 5678 9012 3456"
                  value={bookingDetails.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiryDate"
                id="expiryDate"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="MM/YY"
                value={bookingDetails.expiryDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                id="cvv"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="123"
                value={bookingDetails.cvv}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookNowPage

