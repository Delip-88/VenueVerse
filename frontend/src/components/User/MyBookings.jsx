import { useContext, useEffect, useRef, useState } from "react";
import {  Star, X } from "lucide-react";
import { AuthContext } from "../../middleware/AuthContext";
import Loader from "../../pages/common/Loader";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_REVIEW } from "../Graphql/mutations/ReviewGql";
import { useNavigate } from "react-router-dom";

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "text-green-600";
    case "PENDING":
      return "text-yellow-600";
    case "REFUNDED":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

export default function MyBookingsPage() {
  const { user, loading } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const commentRef = useRef(null);
  const navigate = useNavigate()
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });

  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW);

  useEffect(() => {
    if (user?.bookings) {
      setBookings(user.bookings);
    }
  }, [user]);

  if (loading) return <Loader />;

  const handleReviewClick = (venue) => {
    setSelectedVenue(venue);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment");
      return;
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
        }
      );
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 0, comment: "" });
      setSelectedVenue(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const ReviewModal = () => (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Leave a Review</h3>
          <button
            onClick={() => setIsReviewModalOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
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
                      star <= reviewForm.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={commentRef}
              defaultValue={reviewForm.comment}
              onBlur={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
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
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Price
              </th>
            
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-m font-semibold text-gray-900 cursor-pointer hover:underline" onClick={()=>navigate(`/venue/${booking.venue.id}`)}>
                    {booking.venue.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.date}</div>
                  <div className="text-sm text-gray-500">
                    {booking.timeslots.map((slot, index) => (
                      <span key={index}>
                        {slot.start} - {slot.end}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Rs. {booking.totalPrice}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                      booking.paymentStatus
                    )} bg-${
                      getPaymentStatusColor(booking.paymentStatus).split("-")[1]
                    }-100`}
                  >
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.bookingStatus === "APPROVED" &&
                    booking.paymentStatus === "PAID" && (
                      <button
                        onClick={() => handleReviewClick(booking.venue)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Leave Review
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && <ReviewModal />}
    </div>
  );
}
