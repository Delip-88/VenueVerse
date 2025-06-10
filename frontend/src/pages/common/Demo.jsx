"use client"
import BookingReport from "./Report"

export default function BookingReportDemo() {
  // Sample booking data matching your GraphQL schema
  const sampleBooking = {
    id: "booking_123456",
    user: {
      id: "user_789",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+977-9841234567",
    },
    venue: {
      id: "venue_456",
      name: "Grand Ballroom",
      location: {
        street: "456 Event Plaza",
        city: "Kathmandu",
        province: "Bagmati",
        zipCode: 44600,
      },
      basePricePerHour: 5000.0,
    },
    date: "2024-02-15",
    timeslots: [
      {
        start: "18:00",
        end: "23:00",
      },
    ],
    totalPrice: 28500.0,
    bookingStatus: "APPROVED",
    paymentStatus: "PAID",
    selectedServices: [
      {
        serviceId: "service_1",
        servicePrice: 3500.0,
      },
    ],
    eventType: "Wedding Reception",
    phone: "+977-9841234567",
    additionalNotes:
      "Please arrange for red carpet setup and special lighting for photography session. Catering will be handled by external vendor.",
    attendees: 150,
    createdAt: "2024-01-15T10:30:00Z",
  }

  const companyInfo = {
    name: "VenueBook Nepal",
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977-1-4123456",
    email: "info@venuebook.com.np",
    website: "www.venuebook.com.np",
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <BookingReport booking={sampleBooking} companyInfo={companyInfo} />
    </div>
  )
}
