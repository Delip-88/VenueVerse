"use client"

import { useState, useEffect } from "react"
import {
  Loader,
  Trash2,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ImageIcon,
  Package,
  AlertCircle,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation, useQuery } from "@apollo/client"
import { ADD_VENUE } from "../Graphql/mutations/VenueGql"
import { GET_SERVICES } from "../Graphql/query/venuesGql"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { MY_VENUES } from "../Graphql/query/meGql"

const VENUE_CATEGORIES = [
  "WEDDING",
  "CONFERENCE_HALL",
  "PARTY_HALL",
  "BANQUET",
  "OUTDOOR",
  "MEETING_ROOM",
  "SEMINAR_HALL",
  "CONCERT_HALL",
  "EXHIBITION_CENTER",
  "THEATER",
  "SPORTS_ARENA",
  "RESORT",
  "GARDEN",
  "CLUBHOUSE",
  "ROOFTOP",
  "RESTAURANT",
  "AUDITORIUM",
  "BEACH_VENUE",
  "CONVENTION_CENTER",
  "TRAINING_CENTER",
  "COWORKING_SPACE",
  "PRIVATE_VILLA",
  "CORPORATE_EVENT_SPACE",
]

const AddNewVenue = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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
    facilities: [],
    categories: [], // Changed from category (string) to categories (array)
    image: null,
    services: [],
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [cities, setCities] = useState([])
  const [cityData, setCityData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedServices, setSelectedServices] = useState([])

  const { uploadImage } = useUploadImage()
  const { deleteImage } = useDeleteImage()
  const [addVenue] = useMutation(ADD_VENUE,{
    refetchQueries:[{query: MY_VENUES}],
    awaitRefetchQueries: true
  })
  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES)

  // Format category for display
  const formatCategory = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    setCityData({
      Koshi: ["Biratnagar", "Dharan", "Itahari", "Birtamod", "Dhankuta", "Inaruwa", "Mechinagar"],
      Madhesh: ["Janakpur", "Birgunj", "Kalaiya", "Rajbiraj", "Gaur", "Lahan", "Malangwa"],
      Bagmati: ["Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda", "Chitwan", "Banepa", "Sindhuli"],
      Gandaki: ["Pokhara", "Baglung", "Damauli", "Beni", "Gorkha", "Waling", "Tansen"],
      Lumbini: ["Butwal", "Nepalgunj", "Dang", "Tulsipur", "Kapilvastu", "Bardiya", "Sandhikharka"],
      Karnali: ["Surkhet", "Jumla", "Dailekh", "Kalikot", "Mugu", "Jajarkot", "Dolpa"],
      Sudurpashchim: ["Dhangadhi", "Mahendranagar", "Dadeldhura", "Baitadi", "Darchula", "Tikapur", "Amargadhi"],
    })
  }, [])

  useEffect(() => {
    if (venue.location.province) {
      setCities(cityData[venue.location.province] || [])
    }
  }, [venue.location.province, cityData])

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVenue((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageRemove = () => {
    setVenue((prev) => ({ ...prev, image: null }))
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

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

  const handleCategoryToggle = (category) => {
    setVenue((prev) => {
      const categories = [...prev.categories]

      if (categories.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          categories: categories.filter((c) => c !== category),
        }
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...categories, category],
        }
      }
    })

    // Clear error when categories are selected
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: null }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Basic Information
        if (!venue.name.trim()) newErrors.name = "Venue name is required"
        if (!venue.description.trim()) newErrors.description = "Description is required"
        if (!venue.categories || venue.categories.length === 0)
          newErrors.categories = "At least one category is required"
        break

      case 2: // Location
        if (!venue.location.street.trim()) newErrors.street = "Street address is required"
        if (!venue.location.province) newErrors.province = "Province is required"
        if (!venue.location.city) newErrors.city = "City is required"
        if (venue.location.zipCode && isNaN(venue.location.zipCode)) {
          newErrors.zipCode = "Zip code must be a number"
        }
        break

      case 3: // Capacity & Price
        if (!venue.basePricePerHour || isNaN(venue.basePricePerHour) || venue.basePricePerHour <= 0) {
          newErrors.basePricePerHour = "Valid price per hour is required"
        }
        if (!venue.capacity || isNaN(venue.capacity) || venue.capacity <= 0) {
          newErrors.capacity = "Valid capacity is required"
        }
        break

        break

      case 5: // Services
        const invalidServices = selectedServices.filter(
          (service) =>
            !service.servicePrice || isNaN(service.servicePrice) || service.servicePrice <= 0,
        )

        if (invalidServices.length > 0) {
          newErrors.services = "All selected services must have a valid price"
        }
        break

      case 6: // Image
        if (!venue.image) {
          newErrors.image = "Venue image is required"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      // Display errors
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Final validation
    if (!validateStep(currentStep)) {
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
      return
    }

    setIsSubmitting(true)
    let requiredImageProps = null

    const venueMutation = async () => {
      if (venue.image) {
        try {
          const imageData = await uploadImage(
            venue.image,
            import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
            import.meta.env.VITE_UPLOAD_VENUE_IMAGE_FOLDER,
          )
          if (!imageData) throw new Error("Failed to upload image")

          requiredImageProps = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
          }
        } catch (error) {
          console.error("Image Upload Error:", error)
          throw new Error("Image upload failed")
        }
      }

      try {
        // Format services for the mutation
        const formattedServices = selectedServices.map((service) => ({
          serviceId: service.serviceId,
          servicePrice: Number.parseInt(service.servicePrice, 10),
        }))

        const response = await addVenue({
          variables: {
            venueInput: {
              name: venue.name,
              description: venue.description,
              location: {
                ...venue.location,
                zipCode: venue.location.zipCode ? Number.parseInt(venue.location.zipCode, 10) : null,
              },
              basePricePerHour: Number.parseInt(venue.basePricePerHour, 10),
              capacity: Number.parseInt(venue.capacity, 10),
              categories: venue.categories, // Changed from category to categories
              image: requiredImageProps,
              services: formattedServices,
            },
          },
        })

        if (!response.data?.addVenue) throw new Error("Failed to create venue")
        return response.data.addVenue
      } catch (err) {
        console.error("GraphQL Error:", err)
        if (requiredImageProps) {
          try {
            await deleteImage(requiredImageProps.public_id)
          } catch (deleteError) {
            console.error("Image Delete Error:", deleteError)
          }
        }
        throw new Error(err.message || "Venue creation failed")
      }
    }

    toast
      .promise(venueMutation(), {
        loading: "Adding venue...",
        success: "Venue added successfully!",
        error: (err) => `Failed to add venue: ${err.message}`,
      })
      .then(() => {
        navigate("/dashboard/my-venues")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Basic Information</h2>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={venue.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.name ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={venue.description}
                onChange={handleChange}
                rows="4"
                className={`mt-1 block w-full rounded-md border ${errors.description ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Venue Categories <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Select all categories that apply to your venue</p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {VENUE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      venue.categories.includes(category)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          venue.categories.includes(category) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {venue.categories.includes(category) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <span className="ml-2 text-sm">{formatCategory(category)}</span>
                  </div>
                ))}
              </div>
              {errors.categories && <p className="mt-1 text-sm text-red-500">{errors.categories}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Location Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  id="province"
                  name="location.province"
                  value={venue.location.province}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${errors.province ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select a province</option>
                  {Object.keys(cityData).map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="location.city"
                  value={venue.location.city}
                  onChange={handleChange}
                  disabled={!venue.location.province}
                  className={`mt-1 block w-full rounded-md border ${errors.city ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="location.street"
                  value={venue.location.street}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${errors.street ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="location.zipCode"
                  value={venue.location.zipCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${errors.zipCode ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Capacity & Pricing</h2>
            </div>

            <div>
              <label htmlFor="basePricePerHour" className="block text-sm font-medium text-gray-700">
                Base Price per Hour (Rs.) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rs.</span>
                </div>
                <input
                  type="number"
                  id="basePricePerHour"
                  name="basePricePerHour"
                  value={venue.basePricePerHour}
                  onChange={handleChange}
                  min="0"
                  className={`block w-full pl-12 pr-12 rounded-md border ${errors.basePricePerHour ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">/hour</span>
                </div>
              </div>
              {errors.basePricePerHour && <p className="mt-1 text-sm text-red-500">{errors.basePricePerHour}</p>}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity (Number of People) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={venue.capacity}
                  onChange={handleChange}
                  min="1"
                  className={`block w-full pl-10 rounded-md border ${errors.capacity ? "border-red-500" : "border-gray-300"} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
              </div>
              {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Services</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Services (Optional)</label>
              <p className="text-sm text-gray-500 mb-4">
                Select the services you offer with this venue and set your custom price per hour for each service.
              </p>

              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : servicesData?.services?.length > 0 ? (
                <div className="space-y-4">
                  {servicesData.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                    const selectedService = selectedServices.find((s) => s.serviceId === service.id)

                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className={`h-5 w-5 rounded border ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"} flex items-center justify-center`}
                            >
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </button>
                          </div>

                          {/* Service Image */}
                          {service.image?.secure_url && (
                            <div className="ml-3 mr-3 flex-shrink-0">
                              <img
                                src={service.image.secure_url || "/placeholder.svg"}
                                alt={service.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            </div>
                          )}

                          <div className="ml-3 flex-grow">
                            <div className="flex justify-between">
                              <label
                                htmlFor={`service-${service.id}`}
                                className="font-medium text-gray-700 cursor-pointer"
                              >
                                {service.name}
                              </label>
                              <span className="text-sm text-gray-500">Base: Rs. {service.basePricePerHour}/hour</span>
                            </div>

                            {isSelected && (
                              <div className="mt-3">
                                <label
                                  htmlFor={`price-${service.id}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Your Price per Hour (Rs.)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rs.</span>
                                  </div>
                                  <input
                                    type="number"
                                    id={`price-${service.id}`}
                                    value={selectedService?.servicePrice || ""}
                                    onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                                    min="0"
                                    className="block w-full pl-12 pr-12 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">/hour</span>
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
                <p className="text-center py-4 text-gray-500">No services available</p>
              )}

              {errors.services && <p className="mt-2 text-sm text-red-500">{errors.services}</p>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Venue Image</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Venue Image <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload a high-quality image of your venue. This will be the main image displayed to potential customers.
              </p>

              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.image ? "border-red-300" : "border-gray-300"} border-dashed rounded-md`}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Venue preview"
                    className="h-48 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-500 rounded-full p-2 text-white">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Review & Submit</h2>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Summary</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Basic Information</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Name:</span> {venue.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Categories:</span>{" "}
                      {venue.categories.length > 0
                        ? venue.categories.map((category) => formatCategory(category)).join(", ")
                        : "Not specified"}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Description:</span> {venue.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Address:</span> {venue.location.street}, {venue.location.city},{" "}
                      {venue.location.province}
                      {venue.location.zipCode ? `, ${venue.location.zipCode}` : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Capacity & Pricing</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Capacity:</span> {venue.capacity} people
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">Base Price:</span> Rs. {venue.basePricePerHour}/hour
                    </p>
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Services</h4>
                    <div className="mt-2 space-y-2">
                      {selectedServices.map((service) => {
                        const serviceDetails = servicesData?.services.find((s) => s.id === service.serviceId)
                        return (
                          <div key={service.serviceId} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center">
                              {serviceDetails?.image?.secure_url && (
                                <img
                                  src={serviceDetails.image.secure_url || "/placeholder.svg"}
                                  alt={serviceDetails?.name || "Service"}
                                  className="w-8 h-8 object-cover rounded-md mr-2"
                                />
                              )}
                              <span>{serviceDetails?.name || "Service"}</span>
                            </div>
                            <span>Rs. {service.servicePrice}/hour</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Venue Image</h4>
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Venue preview"
                        className="h-40 w-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please review all information carefully before submitting. Once submitted, your venue will be
                    available for booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Progress bar calculation
  const totalSteps = 6
  const progress = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Add New Venue</h1>
      <p className="text-gray-600 mb-6">Complete the following steps to add your venue</p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-700">{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="hidden md:flex justify-between mb-8">
        {[...Array(totalSteps)].map((_, index) => {
          const stepNum = index + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep

          return (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
              </div>
              <span className="text-xs mt-1 text-gray-500">
                {stepNum === 1 && "Basics"}
                {stepNum === 2 && "Location"}
                {stepNum === 3 && "Pricing"}
                {stepNum === 4 && "Services"}
                {stepNum === 5 && "Image"}
                {stepNum === 6 && "Review"}
              </span>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </div>
              </button>
            ) : (
              <div></div> // Empty div to maintain flex spacing
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </div>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Submit Venue
                  </div>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddNewVenue

