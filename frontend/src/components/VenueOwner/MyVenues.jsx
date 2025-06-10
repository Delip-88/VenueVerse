import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  Search,
  Filter,
  ChevronDown,
  Tag,
  BookOpen,
  IndianRupee,
  Eye,
} from "lucide-react"
import AnotherLoader from "../../pages/common/AnotherLoader"
import { useMutation, useQuery } from "@apollo/client"
import { REMOVE_VENUE } from "../Graphql/mutations/VenueGql"
import { toast } from "react-hot-toast"
import { useDeleteImage } from "../Functions/deleteImage"
import { MY_VENUES } from "../Graphql/query/meGql"

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dduky37gb/image/upload/v1740127136/VenueVerse/venues/svbbysrakec9salwl8ex.png" // Fallback image

export default function MyVenues() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [removeVenue] = useMutation(REMOVE_VENUE)
  const { deleteImage } = useDeleteImage()
  const { data, loading } = useQuery(MY_VENUES)

  // Get unique categories from venues

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues || []) // Ensure it's an array
      setFilteredVenues(data.myVenues || [])
      setIsDataLoading(false)
    }
  }, [data])

  const categories =
    (venues || []).length > 0
      ? [...new Set(venues.flatMap((venue) => venue.categories || []))].filter(Boolean).sort()
      : []

  // Filter and sort venues when search, filter, or sort criteria change
  useEffect(() => {
    if (venues.length > 0) {
      let result = [...venues]

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (venue) =>
            venue.name.toLowerCase().includes(term) ||
            venue.description.toLowerCase().includes(term) ||
            venue.location.city.toLowerCase().includes(term),
        )
      }

      // Apply category filter
      if (filterCategory) {
        result = result.filter((venue) => venue.categories && venue.categories.includes(filterCategory))
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name)
          case "price":
            return a.pricePerHour - b.pricePerHour
          case "bookings":
            return b.bookings.length - a.bookings.length
          case "rating":
            return calculateAverageRatingValue(b.reviews) - calculateAverageRatingValue(a.reviews)
          default:
            return 0
        }
      })

      setFilteredVenues(result)
    }
  }, [venues, searchTerm, filterCategory, sortBy])

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "No ratings"
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    return average.toFixed(1)
  }

  const calculateAverageRatingValue = (reviews = []) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const formatCategory = (category) => {
    if (!category) return "Uncategorized"
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleDeleteClick = (id) => {
    setVenueToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteVenue = async () => {
    setIsLoading(true)
    try {
      // Remove venue via API
      const response = await removeVenue({
        variables: { venueId: venueToDelete },
      })

      const { success, message } = response.data?.removeVenue
      if (success) {
        toast.success(message)

        // Find the venue to delete and extract public_id
        const venue = venues.find((v) => v.id == venueToDelete)
        const publicId = venue?.image?.public_id

        if (publicId) {
          try {
            await deleteImage(publicId)
          } catch (error) {
            console.error("Failed to delete image:", error)
          }
        }
      } else {
        toast.error("Failed to remove venue")
      }

      // Small delay for UI smoothness
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update state
      setVenues((prevVenues) => prevVenues.filter((venue) => venue.id !== venueToDelete))
      setShowDeleteDialog(false)
    } catch (err) {
      console.error(err)
      setError("Failed to delete venue. Please try again.")
    } finally {
      setIsLoading(false)
      setVenueToDelete(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterCategory("")
    setSortBy("name")
  }

  if (loading || isDataLoading) return <AnotherLoader />

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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Venues</h1>
          <p className="text-gray-600 mt-2">Manage your venues and their availability</p>
        </div>
        <button
          onClick={() => navigate("/Dashboard/add-venue")}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Venue
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
              <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="bookings">Sort by Bookings</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {(searchTerm || filterCategory || sortBy !== "name") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Venues</p>
              <p className="text-xl font-semibold">{venues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-xl font-semibold">{venues.reduce((sum, venue) => sum + venue.bookings.length, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Price/Hour</p>
              <p className="text-xl font-semibold">
                Rs.{" "}
                {venues.length > 0
                  ? Math.round(venues.reduce((sum, venue) => sum + venue.basePricePerHour, 0) / venues.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Rating</p>
              <p className="text-xl font-semibold">
                {venues.length > 0 && venues.some((venue) => venue.reviews?.length > 0)
                  ? (
                      venues.reduce((sum, venue) => {
                        const rating = calculateAverageRatingValue(venue.reviews)
                        return sum + (rating || 0)
                      }, 0) / venues.filter((venue) => venue.reviews?.length > 0).length
                    ).toFixed(1)
                  : "No ratings"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-gray-600">
        {filteredVenues.length === 0
          ? "No venues found"
          : `Showing ${filteredVenues.length} of ${venues.length} venues`}
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-12 max-w-lg mx-auto">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No venues found</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first venue.</p>
            <button
              onClick={() => navigate("/Dashboard/add-venue")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Venue
            </button>
          </div>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No venues match your filters</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search criteria or clear filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={venue.image?.secure_url || PLACEHOLDER_IMAGE}
                  alt={venue.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                />
                {venue.categories && venue.categories.length > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs font-medium rounded">
                    {formatCategory(venue.categories[0])}
                    {venue.categories.length > 1 && ` +${venue.categories.length - 1}`}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="text-xl font-semibold cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                  >
                    {venue.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{venue.description}</p>

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
                    <Clock className="h-4 w-4 mr-2 " />
                    Rs. {venue.basePricePerHour}/hour
                  </p>
                  {venue.facilities && venue.facilities.length > 0 && (
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-1 text-gray-600" />
                      <div className="flex flex-wrap gap-1">
                        {venue.facilities.slice(0, 3).map((facility, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                          >
                            {facility}
                          </span>
                        ))}
                        {venue.facilities.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            +{venue.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-gray-600">{calculateAverageRating(venue.reviews)}</span>
                    <span className="ml-2 text-sm text-gray-500">({venue.bookings.length} bookings)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                      aria-label="View venue details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/Dashboard/edit-venue/${venue.id}`)}
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
            <h3 className="text-lg font-semibold mb-2">Are you absolutely sure?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete your venue and remove all associated data from
              our servers.
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
  )
}

