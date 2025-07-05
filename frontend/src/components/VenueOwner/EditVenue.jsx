"use client"

import { useState, useEffect } from "react"
import {
  Loader,
  Trash2,
  Upload,
  ChevronLeft,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ImageIcon,
  AlertCircle,
  Check,
  Tag,
  Clock,
  Building2,
  Star,
  Camera,
  Save,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation, useQuery } from "@apollo/client"
import { UPDATE_VENUE } from "../Graphql/mutations/VenueGql"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { VENUE_BY_ID } from "../Graphql/query/venuesGql"
import { GET_SERVICES } from "../Graphql/query/venuesGql"
import { GET_CATEGORIES } from "../Graphql/query/AdminQuery"


const EditVenue = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Queries and mutations
  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only", // Ensure we get fresh data
  })
  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES)
    const { data: categoriesData, loading: categoriesLoading, } = useQuery(GET_CATEGORIES)
    const VENUE_CATEGORIES =  categoriesData?.categories?.categories || []
  const { uploadImage, loading: uLoading } = useUploadImage()
  const { deleteImage, loading: dLoading } = useDeleteImage()
  const [updateVenue, { loading: vLoading }] = useMutation(UPDATE_VENUE)

  // State
  const [venue, setVenue] = useState({
    name: "",
    description: "",
    location: {
      street: "",
      province: "",
      city: "",
      zipCode: "",
    },
    basePricePerHour: "",
    capacity: "",
    categories: [], // Changed from category to categories (array)
    image: null,
    services: [],
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [cities, setCities] = useState([])
  const [cityData, setCityData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedServices, setSelectedServices] = useState([])
  const [currentImage, setCurrentImage] = useState(null)
  const [hasImageChanged, setHasImageChanged] = useState(false)

  // Initialize venue data when it's loaded
  useEffect(() => {
    if (data?.venue) {
      const venueData = data.venue
      // Convert single category to array if needed
      const categories = venueData.categories || (venueData.category ? [venueData.category] : [])

      setVenue({
        name: venueData.name || "",
        description: venueData.description || "",
        location: {
          street: venueData.location?.street || "",
          province: venueData.location?.province || "",
          city: venueData.location?.city || "",
          zipCode: venueData.location?.zipCode?.toString() || "",
        },
        basePricePerHour: venueData.basePricePerHour?.toString() || "",
        capacity: venueData.capacity?.toString() || "",
        categories: categories, // Use array of categories
        image: null,
        services: venueData.services || [],
      })

      // Set current image if it exists
      if (venueData.image?.secure_url) {
        setCurrentImage(venueData.image)
      }

      // Initialize selected services
      if (venueData.services && venueData.services.length > 0) {
        setSelectedServices(
          venueData.services.map((service) => ({
            serviceId: service.serviceId.id,
            servicePrice: service.servicePrice?.toString() || "",
            category: service.category || "hourly", // Default to hourly if not specified
          })),
        )
      }

      // Set cities based on province
      if (venueData.location?.province) {
        setCities(cityData[venueData.location.province] || [])
      }
    }
  }, [data, cityData])

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Initialize city data
  useEffect(() => {
    setCityData({
      Koshi: ["Biratnagar", "Dharan", "Itahari", "Birtamod", "Dhankuta", "Inaruwa", "Mechinagar"],
      Madhesh: ["Janakpur", "Birgunj", "Kalaiya", "Rajbiraj", "Gaur", "Lahan", "Malangwa"],
      Bagmati: ["Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda", "Chitwan", "Banepa", "Sindhuli"],
      Gandaki: ["Pokhara", "Baglung", "Damauli", "Beni", "Gorkha", "Waling", "Tansen"],
      Lumbini: ["Butwal", "Nepalgunj", "Dang", "Tulsipur", "Kapilvastu", "Bardiya", "Sandhikharka"],
      Karnali: ["Surkhet", "Jumla", "Dailekh", "Kalikot", "Mugu", "Jajarkot", "Dolpa"],
      Sudurpaschim: ["Dhangadhi", "Mahendranagar", "Dadeldhura", "Baitadi", "Darchula", "Tikapur", "Amargadhi"],
    })
  }, [])

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]
      setVenue((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))

      if (locationField === "province") {
        setCities(cityData[value] || [])
        setVenue((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            city: "",
          },
        }))
      }
    } else {
      setVenue((prev) => ({ ...prev, [name]: value }))
    }

    // Clear errors when input changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setVenue((prev) => {
      const isSelected = prev.categories.includes(category)
      if (isSelected) {
        // Remove category if already selected
        return {
          ...prev,
          categories: prev.categories.filter((cat) => cat !== category),
        }
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...prev.categories, category],
        }
      }
    })

    // Clear category error if any
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: null }))
    }
  }

  // Handle image management
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    // Validate file is an image
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, GIF, etc.)")
        return
      }

      setVenue((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
      setHasImageChanged(true)

      // Clear image error if it exists
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }))
      }
    }
  }

  const handleImageRemove = () => {
    setVenue((prev) => ({ ...prev, image: null }))
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setCurrentImage(null)
    setHasImageChanged(true)
  }

  // Handle service management
  const handleServiceToggle = (serviceId) => {
    const isSelected = selectedServices.some((s) => s.serviceId === serviceId)

    if (isSelected) {
      setSelectedServices(selectedServices.filter((s) => s.serviceId !== serviceId))
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          servicePrice: "",
          category: "hourly", // Default to hourly pricing
        },
      ])
    }
  }

  const handleServicePriceChange = (serviceId, price) => {
    setSelectedServices(
      selectedServices.map((service) =>
        service.serviceId === serviceId ? { ...service, servicePrice: price } : service,
      ),
    )
  }

  const handleServiceCategoryChange = (serviceId, category) => {
    setSelectedServices(
      selectedServices.map((service) => (service.serviceId === serviceId ? { ...service, category } : service)),
    )
  }

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {}

    if (!venue.name.trim()) newErrors.name = "Venue name is required"
    if (!venue.description.trim()) newErrors.description = "Description is required"
    if (!venue.location.street.trim()) newErrors.street = "Street address is required"
    if (!venue.location.province) newErrors.province = "Province is required"
    if (!venue.location.city) newErrors.city = "City is required"

    if (!venue.basePricePerHour || isNaN(venue.basePricePerHour) || Number(venue.basePricePerHour) <= 0) {
      newErrors.basePricePerHour = "Valid price per hour is required"
    }

    if (!venue.capacity || isNaN(venue.capacity) || Number(venue.capacity) <= 0) {
      newErrors.capacity = "Valid capacity is required"
    }

    if (!venue.categories || venue.categories.length === 0) {
      newErrors.categories = "At least one category is required"
    }

    // Validate service prices if any are selected
    const invalidServices = selectedServices.filter(
      (service) => !service.servicePrice || isNaN(service.servicePrice) || Number(service.servicePrice) <= 0,
    )

    if (invalidServices.length > 0) {
      newErrors.services = "All selected services must have a valid price"
    }

    // If image was removed and no new image was uploaded
    if (hasImageChanged && !venue.image && !currentImage) {
      newErrors.image = "Venue image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      // Display errors
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
      return
    }

    setIsSubmitting(true)
    let imageProps = currentImage

    const venueMutation = async () => {
      // Handle image upload if changed
      if (hasImageChanged && venue.image) {
        try {
          const imageData = await uploadImage(
            venue.image,
            import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
            import.meta.env.VITE_UPLOAD_VENUE_IMAGE_FOLDER,
          )

          if (!imageData) throw new Error("Failed to upload image")

          imageProps = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            asset_id: imageData.asset_id,
            version: Number.parseInt(imageData.version, 10),
            format: imageData.format,
            width: Number.parseInt(imageData.width, 10),
            height: Number.parseInt(imageData.height, 10),
            created_at: imageData.created_at,
          }

          // Delete old image if it exists
          if (currentImage?.public_id) {
            try {
              await deleteImage(currentImage.public_id)
            } catch (deleteError) {
              console.error("Failed to delete old image:", deleteError)
            }
          }
        } catch (error) {
          console.error("Image Upload Error:", error)
          throw new Error("Image upload failed")
        }
      } else if (hasImageChanged && !venue.image) {
        // If image was removed, set to null
        imageProps = null
        // Delete old image if it exists
        if (currentImage?.public_id) {
          try {
            await deleteImage(currentImage.public_id)
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError)
          }
        }
      }

      try {
        // Remove __typename from objects to avoid GraphQL errors
        const cleanImageProps = imageProps ? removeTypename(imageProps) : null
        const cleanLocation = removeTypename(venue.location)

        // Format services for the mutation
        const formattedServices = selectedServices.map((service) => ({
          serviceId: service.serviceId,
          servicePrice: Number.parseInt(service.servicePrice, 10),
          category: service.category || "fixed", // Ensure category is always present, default to "fixed" if missing
        }))

        // Also, add a check to ensure all services have a category
        if (selectedServices.some((service) => !service.category)) {
          console.warn("Some services were missing a category, defaulting to 'fixed'")
        }

        const response = await updateVenue({
          variables: {
            updateVenueInput: {
              name: venue.name,
              description: venue.description,
              location: {
                ...cleanLocation,
                zipCode: venue.location.zipCode ? Number.parseInt(venue.location.zipCode, 10) : null,
              },
              basePricePerHour: Number.parseInt(venue.basePricePerHour, 10),
              capacity: Number.parseInt(venue.capacity, 10),
              categories: venue.categories, // Send array of categories
              image: cleanImageProps,
              services: formattedServices,
            },
            id,
          },
        })

        const { success, message } = response.data?.updateVenue

        if (!success) {
          throw new Error(message || "Failed to update venue")
        }

        return message
      } catch (err) {
        console.error("GraphQL Error:", err)
        throw new Error(err.message || "Venue update failed")
      }
    }

    toast
      .promise(venueMutation(), {
        loading: "Updating venue...",
        success: (message) => message || "Venue updated successfully!",
        error: (err) => err.message || "Failed to update venue. Please try again.",
      })
      .then(() => {
        navigate("/dashboard/my-venues")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Helper function to remove __typename from objects
  const removeTypename = (obj) => {
    if (!obj) return null
    const { __typename, ...rest } = obj
    return rest
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <div className="animate-pulse rounded-full h-12 w-12 bg-teal-100 mx-auto mt-[-56px] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading venue data...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your venue information</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Venue</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Return to My Venues
          </button>
        </div>
      </div>
    )

  if (!data?.venue)
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-100">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Return to My Venues
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/my-venues")}
                className="flex items-center text-teal-600 hover:text-teal-800 transition-colors duration-200 group"
              >
                <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to My Venues</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Edit Venue
                </h1>
                <p className="text-sm text-gray-600">Update your venue information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={(e) => e.preventDefault()} className="divide-y divide-gray-100">
            {/* Basic Information Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-600">Essential details about your venue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={venue.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                    } focus:ring-4 focus:ring-opacity-20`}
                    placeholder="Enter your venue name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={venue.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none ${
                      errors.description
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                    } focus:ring-4 focus:ring-opacity-20`}
                    placeholder="Describe your venue, its features, and what makes it special..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Venue Categories</h2>
                  <p className="text-sm text-gray-600">Select all categories that apply to your venue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {VENUE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      venue.categories.includes(category)
                        ? "border-teal-300 bg-gradient-to-r from-teal-50 to-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-teal-200 bg-white"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          venue.categories.includes(category)
                            ? "bg-gradient-to-r from-teal-500 to-blue-500 shadow-sm"
                            : "border-2 border-gray-300"
                        }`}
                      >
                        {venue.categories.includes(category) && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{formatCategory(category)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-4 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.categories}
                </p>
              )}
            </div>

            {/* Location Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
                  <p className="text-sm text-gray-600">Where is your venue located?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="province"
                    name="location.province"
                    value={venue.location.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.province
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                    } focus:ring-4 focus:ring-opacity-20`}
                  >
                    <option value="">Select a province</option>
                    {Object.keys(cityData).map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="city"
                    name="location.city"
                    value={venue.location.city}
                    onChange={handleChange}
                    disabled={!venue.location.province}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.city
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                    } focus:ring-4 focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="location.street"
                    value={venue.location.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      errors.street
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                    } focus:ring-4 focus:ring-opacity-20`}
                    placeholder="Enter street address"
                  />
                  {errors.street && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="location.zipCode"
                    value={venue.location.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-200 focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Pricing Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Capacity & Pricing</h2>
                  <p className="text-sm text-gray-600">Set your venue capacity and pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="basePricePerHour" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per Hour (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="basePricePerHour"
                      name="basePricePerHour"
                      value={venue.basePricePerHour}
                      onChange={handleChange}
                      min="0"
                      className={`w-full pl-12 pr-16 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.basePricePerHour
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                      } focus:ring-4 focus:ring-opacity-20`}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">/hour</span>
                    </div>
                  </div>
                  {errors.basePricePerHour && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.basePricePerHour}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacity (Number of People) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={venue.capacity}
                      onChange={handleChange}
                      min="1"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.capacity
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                      } focus:ring-4 focus:ring-opacity-20`}
                      placeholder="0"
                    />
                  </div>
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.capacity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Additional Services</h2>
                  <p className="text-sm text-gray-600">Select services you offer and set pricing</p>
                </div>
              </div>

              {servicesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-200 border-t-teal-600"></div>
                </div>
              ) : servicesData?.services?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesData.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                    const selectedService = selectedServices.find((s) => s.serviceId === service.id)

                    return (
                      <div
                        key={service.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-teal-300 bg-gradient-to-r from-teal-50 to-blue-50"
                            : "border-gray-200 hover:border-teal-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? "bg-gradient-to-r from-teal-500 to-blue-500"
                                : "border-2 border-gray-300 hover:border-teal-300"
                            }`}
                          >
                            {isSelected && <Check className="h-4 w-4 text-white" />}
                          </button>

                          <div className="flex-grow">
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">{service.name}</label>

                            {isSelected && (
                              <div className="mt-3 space-y-3">
                                {/* Pricing Category Selection */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">Pricing Type</label>
                                  <div className="flex space-x-4">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "hourly"}
                                        onChange={() => handleServiceCategoryChange(service.id, "hourly")}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                      />
                                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        Hourly
                                      </span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "fixed"}
                                        onChange={() => handleServiceCategoryChange(service.id, "fixed")}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                      />
                                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        Fixed
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                {/* Price Input */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Your Price {selectedService.category === "hourly" ? "per Hour" : ""} (Rs.)
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">Rs.</span>
                                    </div>
                                    <input
                                      type="number"
                                      value={selectedService?.servicePrice || ""}
                                      onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                                      min="0"
                                      className="w-full pl-10 pr-12 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-20 transition-all duration-200"
                                      placeholder="0"
                                    />
                                    {selectedService.category === "hourly" && (
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-xs">/hr</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No services available</p>
                </div>
              )}
              {errors.services && (
                <p className="mt-4 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.services}
                </p>
              )}
            </div>

            {/* Image Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Venue Image</h2>
                  <p className="text-sm text-gray-600">Upload a high-quality image of your venue</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-400 transition-colors duration-200">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-teal-600" />
                    </div>
                    <div>
                      <label
                        htmlFor="image"
                        className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <ImageIcon className="h-5 w-5 mr-2" />
                        Choose Image
                      </label>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </div>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {(imagePreview || currentImage?.secure_url) && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={imagePreview || currentImage?.secure_url || "/placeholder.svg"}
                      alt="Venue preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {errors.image && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-8 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/my-venues")}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel Changes
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Updating Venue...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-5 w-5 mr-2" />
                      Update Venue
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditVenue
