"use client";

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Clock,
  Star,
  Trash2,
  Plus,
  AlertCircle,
  Loader,
  Calendar,
  Pencil,
} from "lucide-react";
import { AuthContext } from "../../middleware/AuthContext";
import AnotherLoader from "../../pages/common/AnotherLoader";
import { useMutation } from "@apollo/client";
import { REMOVE_VENUE } from "../Graphql/mutations/VenueGql";
import { toast } from "react-hot-toast";
import { useDeleteImage } from "../Functions/deleteImage";

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dduky37gb/image/upload/v1740127136/VenueVerse/venues/svbbysrakec9salwl8ex.png"; // Fallback image

export default function MyVenues() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const { user, loading, CLOUD_NAME } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [removeVenue] = useMutation(REMOVE_VENUE);
  const { deleteImage, loading: dLoading } = useDeleteImage();
  useEffect(() => {
    if (user?.venues) {
      setVenues(user.venues);
      setIsDataLoading(false);
    }
  }, [user]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "No ratings";
    const average =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return average.toFixed(1);
  };
  const handleDeleteClick = (id) => {
    setVenueToDelete(id);
    setShowDeleteDialog(true);
  };
  const handleDeleteVenue = async () => {
    setIsLoading(true);
    try {
      // Remove venue via API
      const response = await removeVenue({
        variables: { venueId: venueToDelete },
      });
  
      const { success, message } = response.data?.removeVenue;
      if (success) {
        toast.success(message);
  
        // Find the venue to delete and extract public_id
        const venue = venues.find((v) => v.id == venueToDelete);
        const publicId = venue?.image?.public_id;
  
        if (publicId) {
          try {
            await deleteImage(CLOUD_NAME, publicId);
          } catch (error) {
            console.error("Failed to delete image:", error);
          }
        }
      } else {
        toast.error("Failed to remove venue");
      }
  
      // Small delay for UI smoothness
      await new Promise((resolve) => setTimeout(resolve, 1000));
  
      // Update state
      setVenues((prevVenues) =>
        prevVenues.filter((venue) => venue.id !== venueToDelete)
      );
      setShowDeleteDialog(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete venue. Please try again.");
    } finally {
      setIsLoading(false);
      setVenueToDelete(null);
    }
  };
  

  if (loading || isDataLoading) return <AnotherLoader />;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Venues</h1>
          <p className="text-gray-600 mt-2">
            Manage your venues and their availability
          </p>
        </div>
        <button
          onClick={() => navigate("/Dashboard/add-venue")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Venue
        </button>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-12 max-w-lg mx-auto">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No venues found
            </h3>
            <p className="mt-2 text-gray-500">
              Get started by adding your first venue.
            </p>
            <button
              onClick={() => navigate("/Dashboard/add-venue")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Venue
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={venue.image?.secure_url || PLACEHOLDER_IMAGE} // Use placeholder if missing
                alt={venue.name}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="text-xl font-semibold cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                  >
                    {venue.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {venue.description}
                </p>

                <div className="space-y-2 mb-4">
                  <p className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {venue.location.street}, {venue.location.city}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Capacity: {venue.capacity}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />Rs. {venue.pricePerHour}/hour
                  </p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    <div className="flex flex-wrap gap-1">
                      {venue.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-gray-600">
                      {calculateAverageRating(venue.reviews)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({venue.bookings.length} bookings)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/Dashboard/edit-venue/${venue.id}`)
                      }
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                      aria-label="Edit venue"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(venue.id)}
                      disabled={isLoading}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Delete venue"
                    >
                      {isLoading && venueToDelete === venue.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete your
              venue and remove all associated data from our servers.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVenue}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
