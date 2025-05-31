"use client"

import { useContext, useEffect, useRef, useState } from "react"
import { Calendar, Star, X, ChevronRight, Clock, CreditCard } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useMutation } from "@apollo/client"
import toast from "react-hot-toast"
import { CREATE_REVIEW } from "../Graphql/mutations/ReviewGql"
import { useNavigate } from "react-router-dom"

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "bg-teal-100 text-teal-800 border-teal-200"
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "REFUNDED":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case "PAID":
      return <CreditCard className="w-4 h-4 mr-1" />
    case "PENDING":
      return <Clock className="w-4 h-4 mr-1" />
    case "REFUNDED":
      return <CreditCard className="w-4 h-4 mr-1" />
    default:
      return <CreditCard className="w-4 h-4 mr-1" />
  }
}

export default function MyBookingsPage() {
  const { user, loading } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const commentRef = useRef(null)
  const navigate = useNavigate()
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  })

  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW)

  useEffect(() => {
    if (user?.bookings) {
      // Sort bookings by date (newest first)
      const sortedBookings = [...user.bookings].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
      setBookings(sortedBookings)
    }
  }, [user])

  if (loading) return <Loader />

  const handleReviewClick = (venue) => {
    setSelectedVenue(venue)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) {
      toast.error("Please select a rating")
      return
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      await toast.promise(
        createReview({
          variables: {
            input: {
              venue: selectedVenue.id,
              rating: Number.parseInt(reviewForm.rating),
              comment: reviewForm.comment,
            },
          },
        }),
        {
          loading: "Submitting review...",
          success: "Review submitted successfully!",
          error: "Failed to submit review",
        },
      )
      setIsReviewModalOpen(false)
      setReviewForm({ rating: 0, comment: "" })
      setSelectedVenue(null)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const ReviewModal = () => (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Leave a Review</h3>
          <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              ref={commentRef}
              defaultValue={reviewForm.comment}
              onBlur={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-teal-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
          <button
            onClick={() => navigate("/venues")}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Browse Venues
          </button>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="p-4">
              <div
                className="text-lg font-semibold text-teal-700 mb-2 cursor-pointer hover:underline flex items-center"
                onClick={() => navigate(`/venue/${booking.venue.id}`)}
              >
                {booking.venue.name}
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div className="font-medium mb-1">Time Slots:</div>
                {booking.timeslots.map((slot, index) => (
                  <div key={index} className="ml-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-gray-900">Total: Rs. {booking.totalPrice}</div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getPaymentStatusColor(booking.paymentStatus)}`}
                >
                  {getPaymentStatusIcon(booking.paymentStatus)}
                  {booking.paymentStatus}
                </div>
              </div>

              {booking.bookingStatus === "APPROVED" &&
                booking.paymentStatus === "PAID" &&
                new Date(booking.date) < new Date() && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleReviewClick(booking.venue)}
                      className="w-full text-center text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center justify-center"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Leave Review
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))
      )}

      {/* Review Modal */}
      {isReviewModalOpen && <ReviewModal />}
    </div>
  )
}
