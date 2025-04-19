import {
  Star,
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  IndianRupee,
  Music,
  Utensils,
  Camera,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@apollo/client";
import { VENUE_BY_ID } from "../../components/Graphql/query/venuesGql";
import Loader from "./Loader";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../middleware/AuthContext";
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl";

const VenueDetailsPage = () => {
  const { id } = useParams();

  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
  });

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>;

  const venue = data.venue;

  const averageRating =
    venue.reviews.length > 0
      ? (
          venue.reviews.reduce((sum, review) => sum + review.rating, 0) /
          venue.reviews.length
        ).toFixed(1)
      : "No ratings";

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("dj") || name.includes("music"))
      return <Music className="mr-2" size={20} />;
    if (name.includes("catering") || name.includes("food"))
      return <Utensils className="mr-2" size={20} />;
    if (name.includes("photo") || name.includes("video"))
      return <Camera className="mr-2" size={20} />;
    return <Sparkles className="mr-2" size={20} />;
  };

  // Format category name for display
  const formatCategory = (category) => {
    if (!category) return "";
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleNavigate = (id) => {
    localStorage.setItem("searchedVenueId", id);
    navigate(
      isAuthenticated ? `/Home/venue/${id}/book-now` : "/login"
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{venue.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <img
          src={getOptimizedCloudinaryUrl(venue.image?.secure_url) || "/placeholder.svg"}
          alt={venue.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-between">
          <div>
            <p className="flex items-center text-gray-600 mb-2">
              <MapPin className="mr-2" size={20} />
              {venue.location.street}, {venue.location.city},{" "}
              {venue.location.province}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <Users className="mr-2" size={20} />
              Capacity: {venue.capacity}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <Clock className="mr-2" size={20} />
              <IndianRupee className="mr-1" size={16} />
              {venue.basePricePerHour} per hour
            </p>
            <div className="flex items-center mb-2">
              <Star
                className="text-yellow-400 mr-1"
                size={20}
                fill="currentColor"
              />
              <span className="font-bold mr-2">{averageRating}</span>
              <span className="text-gray-600">
                ({venue.reviews.length} reviews)
              </span>
            </div>
          </div>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition duration-200"
            onClick={() =>
              handleNavigate(venue.id)
            }
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700">{venue.description}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Event Types</h2>
        {venue.categories && venue.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {venue.categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {formatCategory(category)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No specific event types listed</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Available Services</h2>
        {venue.services && venue.services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {venue.services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex"
              >
                <div className="mr-3 flex-shrink-0">
                  {service.serviceId.image?.secure_url ? (
                    <img
                      src={
                        getOptimizedCloudinaryUrl(service.serviceId.image.secure_url) || "/placeholder.svg"
                      }
                      alt={service.serviceId.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-green-600">
                      {getServiceIcon(service.serviceId.name)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{service.serviceId.name}</h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <IndianRupee className="mr-1" size={14} />
                    Rs. {service.servicePrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No additional services available</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
        {venue.reviews.length === 0 ? (
          <p className="text-gray-700">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {venue.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-2">
                    {review?.user?.name}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Venue Owner</h2>
        <p className="flex items-center text-gray-700 mb-2">
          <Users className="mr-2" size={20} />
          {venue.owner.name}
        </p>
        <p className="flex items-center text-gray-700 mb-2">
          <Mail className="mr-2" size={20} />
          {venue.owner.email}
        </p>
        {venue.owner.phone && (
          <p className="flex items-center text-gray-700">
            <Phone className="mr-2" size={20} />
            {venue.owner.phone}
          </p>
        )}
      </div>
    </div>
  );
};

export default VenueDetailsPage;
