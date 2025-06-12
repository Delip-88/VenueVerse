"use client"

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
  Building2,
} from "lucide-react"
import AnotherLoader from "../../pages/common/AnotherLoader"
import { useMutation, useQuery } from "@apollo/client"
import { REMOVE_VENUE } from "../Graphql/mutations/VenueGql"
import { toast } from "react-hot-toast"
import { useDeleteImage } from "../Functions/deleteImage"
import { MY_VENUES } from "../Graphql/query/meGql"

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dduky37gb/image/upload/v1740127136/VenueVerse/venues/svbbysrakec9salwl8ex.png"

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

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues || [])
      setFilteredVenues(data.myVenues || [])
      setIsDataLoading(false)
    }
  }, [data])

  const categories =
    (venues || []).length > 0
      ? [...new Set(venues.flatMap((venue) => venue.categories || []))].filter(Boolean).sort()
      : []

  useEffect(() => {
    if (venues.length > 0) {
      let result = [...venues]

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (venue) =>
            venue.name.toLowerCase().includes(term) ||
            venue.description.toLowerCase().includes(term) ||
            venue.location.city.toLowerCase().includes(term),
        )
      }

      if (filterCategory) {
        result = result.filter((venue) => venue.categories && venue.categories.includes(filterCategory))
      }

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
      const response = await removeVenue({
        variables: { venueId: venueToDelete },
      })

      const { success, message } = response.data?.removeVenue
      if (success) {
        toast.success(message)

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

      await new Promise((resolve) => setTimeout(resolve, 1000))

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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <Building2 className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Venues</h1>
                <p className="text-gray-600 mt-1">Manage your venues and track their performance</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/Dashboard/add-venue")}
              className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Venue
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search venues by name, description, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors min-w-[160px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
                <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors min-w-[160px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="bookings">Sort by Bookings</option>
                  <option value="rating">Sort by Rating</option>
                </select>
                <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              {(searchTerm || filterCategory || sortBy !== "name") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-teal-100 text-teal-600 mr-4">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.reduce((sum, venue) => sum + venue.bookings.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 mr-4">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price/Hour</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{" "}
                  {venues.length > 0
                    ? Math.round(venues.reduce((sum, venue) => sum + venue.basePricePerHour, 0) / venues.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
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
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            {filteredVenues.length === 0
              ? "No venues found"
              : `Showing ${filteredVenues.length} of ${venues.length} venues`}
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first venue to begin managing bookings.</p>
              <button
                onClick={() => navigate("/Dashboard/add-venue")}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Venue
              </button>
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-amber-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues match your filters</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or clear filters to see all venues.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                <div className="relative">
                  <img
                    src={venue.image?.secure_url || PLACEHOLDER_IMAGE}
                    alt={venue.name}
                    className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                    onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                  />
                  {venue.categories && venue.categories.length > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                        {formatCategory(venue.categories[0])}
                        {venue.categories.length > 1 && ` +${venue.categories.length - 1}`}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                      {venue.bookings.length} bookings
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-teal-600 transition-colors line-clamp-1"
                      onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                    >
                      {venue.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{venue.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-3 text-teal-600" />
                      <span className="text-sm">
                        {venue.location.street}, {venue.location.city}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-3 text-teal-600" />
                      <span className="text-sm">Capacity: {venue.capacity} people</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-3 text-teal-600" />
                      <span className="text-sm font-medium">Rs. {venue.basePricePerHour}/hour</span>
                    </div>
                    {venue.facilities && venue.facilities.length > 0 && (
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mr-3 mt-1 text-teal-600" />
                        <div className="flex flex-wrap gap-1">
                          {venue.facilities.slice(0, 2).map((facility, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200"
                            >
                              {facility}
                            </span>
                          ))}
                          {venue.facilities.length > 2 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              +{venue.facilities.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{calculateAverageRating(venue.reviews)}</span>
                      <span className="ml-2 text-xs text-gray-500">({venue.reviews?.length || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        aria-label="View venue details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/Dashboard/edit-venue/${venue.id}`)}
                        className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                        aria-label="Edit venue"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(venue.id)}
                        disabled={isLoading}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Venue</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you absolutely sure you want to delete this venue? This action cannot be undone and will permanently
                remove all associated data including bookings and reviews.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVenue}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2 inline" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Venue"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
