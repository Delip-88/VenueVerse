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
  Clock,
  Tag,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation, useQuery } from "@apollo/client"
import { ADD_VENUE } from "../Graphql/mutations/VenueGql"
import { GET_SERVICES } from "../Graphql/query/venuesGql"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { MY_VENUES } from "../Graphql/query/meGql"
import { GET_CATEGORIES } from "../Graphql/query/AdminQuery"

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
  const [formSubmitted, setFormSubmitted] = useState(false)

  const { uploadImage } = useUploadImage()
  const { deleteImage } = useDeleteImage()
  const [addVenue] = useMutation(ADD_VENUE, {
    refetchQueries: [{ query: MY_VENUES }],
    awaitRefetchQueries: true,
  })
  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES)
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES)

  const VENUE_CATEGORIES = categoriesData?.categories?.categories || []

  // Enhanced validation functions
  const validateText = (text, fieldName, minLength = 3, maxLength = 100) => {
    const errors = []

    // Check if empty or only whitespace
    if (!text || !text.trim()) {
      errors.push(`${fieldName} is required`)
      return errors
    }

    const trimmedText = text.trim()

    // Check minimum length
    if (trimmedText.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`)
    }

    // Check maximum length
    if (trimmedText.length > maxLength) {
      errors.push(`${fieldName} must not exceed ${maxLength} characters`)
    }

    // Check for invalid patterns
    const invalidPatterns = [
      { pattern: /\.{3,}/, message: "Multiple consecutive dots (...) are not allowed" },
      { pattern: /^[.\s]*$/, message: "Cannot contain only dots and spaces" },
      { pattern: /^\s*test\s*$/i, message: "Test entries are not allowed" },
      { pattern: /^\s*sample\s*$/i, message: "Sample entries are not allowed" },
      { pattern: /^\s*example\s*$/i, message: "Example entries are not allowed" },
      { pattern: /^\s*dummy\s*$/i, message: "Dummy entries are not allowed" },
      { pattern: /^[^a-zA-Z0-9\s]*$/, message: "Must contain at least some letters or numbers" },
      { pattern: /(.)\1{4,}/, message: "Cannot contain more than 4 consecutive identical characters" },
      { pattern: /^\d+$/, message: "Cannot contain only numbers" },
    ]

    for (const { pattern, message } of invalidPatterns) {
      if (pattern.test(trimmedText)) {
        errors.push(`${fieldName}: ${message}`)
      }
    }

    // Check for profanity or inappropriate content (basic check)
    const inappropriateWords = ["fuck", "shit", "damn", "hell", "ass", "bitch", "bastard"]
    const lowerText = trimmedText.toLowerCase()
    for (const word of inappropriateWords) {
      if (lowerText.includes(word)) {
        errors.push(`${fieldName} contains inappropriate language`)
        break
      }
    }

    return errors
  }

  const validateDescription = (text) => {
    const errors = validateText(text, "Description", 10, 500)

    if (errors.length === 0) {
      const trimmedText = text.trim()

      // Additional description-specific validations
      if (trimmedText.split(" ").length < 5) {
        errors.push("Description must contain at least 5 words")
      }

      // Check for meaningful content
      const meaningfulWords = trimmedText
        .split(" ")
        .filter(
          (word) =>
            word.length > 2 &&
            ![
              "the",
              "and",
              "for",
              "are",
              "but",
              "not",
              "you",
              "all",
              "can",
              "had",
              "her",
              "was",
              "one",
              "our",
              "out",
              "day",
              "get",
              "has",
              "him",
              "his",
              "how",
              "its",
              "may",
              "new",
              "now",
              "old",
              "see",
              "two",
              "who",
              "boy",
              "did",
              "man",
              "men",
              "put",
              "say",
              "she",
              "too",
              "use",
            ].includes(word.toLowerCase()),
        )

      if (meaningfulWords.length < 3) {
        errors.push("Description must contain at least 3 meaningful words")
      }
    }

    return errors
  }

  const validateNumericField = (value, fieldName, min = 1, max = 999999) => {
    const errors = []

    if (!value || value.toString().trim() === "") {
      errors.push(`${fieldName} is required`)
      return errors
    }

    const numValue = Number(value)

    if (isNaN(numValue)) {
      errors.push(`${fieldName} must be a valid number`)
      return errors
    }

    if (numValue < min) {
      errors.push(`${fieldName} must be at least ${min}`)
    }

    if (numValue > max) {
      errors.push(`${fieldName} cannot exceed ${max}`)
    }

    // Check for decimal places where not appropriate
    if (fieldName === "Capacity" && numValue % 1 !== 0) {
      errors.push(`${fieldName} must be a whole number`)
    }

    return errors
  }

  const validateLocation = (location) => {
    const errors = {}

    // Validate street address
    const streetErrors = validateText(location.street, "Street address", 5, 100)
    if (streetErrors.length > 0) {
      errors.street = streetErrors[0]
    }

    // Validate province
    if (!location.province || location.province.trim() === "") {
      errors.province = "Province is required"
    }

    // Validate city
    if (!location.city || location.city.trim() === "") {
      errors.city = "City is required"
    }

    // Validate zip code if provided
    if (location.zipCode && location.zipCode.trim() !== "") {
      const zipCode = location.zipCode.trim()
      if (!/^\d{4,6}$/.test(zipCode)) {
        errors.zipCode = "ZIP code must be 4-6 digits"
      }
    }

    return errors
  }

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
      Sudurpaschim: ["Dhangadhi", "Mahendranagar", "Dadeldhura", "Baitadi", "Darchula", "Tikapur", "Amargadhi"],
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

    // Real-time validation
    if (name === "name") {
      const nameErrors = validateText(value, "Venue name", 3, 50)
      if (nameErrors.length > 0) {
        setErrors((prev) => ({ ...prev, name: nameErrors[0] }))
      } else {
        setErrors((prev) => ({ ...prev, name: null }))
      }
    } else if (name === "description") {
      const descErrors = validateDescription(value)
      if (descErrors.length > 0) {
        setErrors((prev) => ({ ...prev, description: descErrors[0] }))
      } else {
        setErrors((prev) => ({ ...prev, description: null }))
      }
    } else if (name === "basePricePerHour") {
      const priceErrors = validateNumericField(value, "Base price per hour", 100, 50000)
      if (priceErrors.length > 0) {
        setErrors((prev) => ({ ...prev, basePricePerHour: priceErrors[0] }))
      } else {
        setErrors((prev) => ({ ...prev, basePricePerHour: null }))
      }
    } else if (name === "capacity") {
      const capacityErrors = validateNumericField(value, "Capacity", 1, 10000)
      if (capacityErrors.length > 0) {
        setErrors((prev) => ({ ...prev, capacity: capacityErrors[0] }))
      } else {
        setErrors((prev) => ({ ...prev, capacity: null }))
      }
    } else if (name.startsWith("location.")) {
      // Clear location-specific errors when input changes
      const locationField = name.split(".")[1]
      if (errors[locationField]) {
        setErrors((prev) => ({ ...prev, [locationField]: null }))
      }
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]

    // Validate file is an image
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, GIF, etc.)")
        return
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("Image size must be less than 10MB")
        return
      }

      // Check image dimensions (optional)
      const img = new Image()
      img.onload = function () {
        if (this.width < 400 || this.height < 300) {
          toast.error("Image must be at least 400x300 pixels")
          return
        }

        setVenue((prev) => ({ ...prev, image: file }))
        setImagePreview(URL.createObjectURL(file))

        // Clear image error if it exists
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: null }))
        }
      }
      img.src = URL.createObjectURL(file)
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

    // Real-time validation for service prices
    const priceErrors = validateNumericField(price, "Service price", 50, 20000)
    if (priceErrors.length > 0) {
      setErrors((prev) => ({ ...prev, services: priceErrors[0] }))
    } else {
      // Check if all selected services have valid prices
      const updatedServices = selectedServices.map((service) =>
        service.serviceId === serviceId ? { ...service, servicePrice: price } : service,
      )
      const invalidServices = updatedServices.filter(
        (service) => !service.servicePrice || isNaN(service.servicePrice) || service.servicePrice <= 0,
      )
      if (invalidServices.length === 0) {
        setErrors((prev) => ({ ...prev, services: null }))
      }
    }
  }

  const handleServiceCategoryChange = (serviceId, category) => {
    setSelectedServices(
      selectedServices.map((service) => (service.serviceId === serviceId ? { ...service, category } : service)),
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
        // Validate name
        const nameErrors = validateText(venue.name, "Venue name", 3, 50)
        if (nameErrors.length > 0) {
          newErrors.name = nameErrors[0]
        }

        // Validate description
        const descErrors = validateDescription(venue.description)
        if (descErrors.length > 0) {
          newErrors.description = descErrors[0]
        }

        // Validate categories
        if (!venue.categories || venue.categories.length === 0) {
          newErrors.categories = "At least one category is required"
        }
        break

      case 2: // Location
        const locationErrors = validateLocation(venue.location)
        Object.assign(newErrors, locationErrors)
        break

      case 3: // Capacity & Price
        // Validate price
        const priceErrors = validateNumericField(venue.basePricePerHour, "Base price per hour", 100, 50000)
        if (priceErrors.length > 0) {
          newErrors.basePricePerHour = priceErrors[0]
        }

        // Validate capacity
        const capacityErrors = validateNumericField(venue.capacity, "Capacity", 1, 10000)
        if (capacityErrors.length > 0) {
          newErrors.capacity = capacityErrors[0]
        }
        break

      case 4: // Services
        const invalidServices = selectedServices.filter((service) => {
          const priceErrors = validateNumericField(service.servicePrice, "Service price", 50, 20000)
          return priceErrors.length > 0
        })

        if (invalidServices.length > 0) {
          newErrors.services = "All selected services must have a valid price (Rs. 50 - Rs. 20,000)"
        }
        break

      case 5: // Image
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
    setFormSubmitted(true)

    // Final comprehensive validation
    const allErrors = {}

    // Validate all steps
    for (let step = 1; step <= 5; step++) {
      const stepErrors = {}

      switch (step) {
        case 1:
          const nameErrors = validateText(venue.name, "Venue name", 3, 50)
          if (nameErrors.length > 0) stepErrors.name = nameErrors[0]

          const descErrors = validateDescription(venue.description)
          if (descErrors.length > 0) stepErrors.description = descErrors[0]

          if (!venue.categories || venue.categories.length === 0) {
            stepErrors.categories = "At least one category is required"
          }
          break

        case 2:
          const locationErrors = validateLocation(venue.location)
          Object.assign(stepErrors, locationErrors)
          break

        case 3:
          const priceErrors = validateNumericField(venue.basePricePerHour, "Base price per hour", 100, 50000)
          if (priceErrors.length > 0) stepErrors.basePricePerHour = priceErrors[0]

          const capacityErrors = validateNumericField(venue.capacity, "Capacity", 1, 10000)
          if (capacityErrors.length > 0) stepErrors.capacity = capacityErrors[0]
          break

        case 4:
          const invalidServices = selectedServices.filter((service) => {
            const serviceErrors = validateNumericField(service.servicePrice, "Service price", 50, 20000)
            return serviceErrors.length > 0
          })
          if (invalidServices.length > 0) {
            stepErrors.services = "All selected services must have a valid price"
          }
          break

        case 5:
          if (!venue.image) stepErrors.image = "Venue image is required"
          break
      }

      Object.assign(allErrors, stepErrors)
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      Object.values(allErrors).forEach((error) => {
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
          category: service.category, // Include the pricing category (hourly/fixed)
        }))

        const response = await addVenue({
          variables: {
            venueInput: {
              name: venue.name.trim(),
              description: venue.description.trim(),
              location: {
                street: venue.location.street.trim(),
                province: venue.location.province,
                city: venue.location.city,
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
              <div className="bg-teal-500 rounded-full p-2 text-white">
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
                maxLength={50}
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                placeholder="Enter a descriptive venue name (3-50 characters)"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              <p className="mt-1 text-xs text-gray-500">{venue.name.length}/50 characters</p>
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
                maxLength={500}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                placeholder="Provide a detailed description of your venue, its features, and what makes it special (minimum 10 characters, at least 5 words)"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {venue.description.length}/500 characters •{" "}
                {
                  venue.description
                    .trim()
                    .split(" ")
                    .filter((word) => word.length > 0).length
                }{" "}
                words
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Venue Categories <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Select all categories that apply to your venue</p>
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8 text-teal-500 animate-spin" />
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {VENUE_CATEGORIES.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        venue.categories.includes(category)
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            venue.categories.includes(category) ? "bg-teal-500 border-teal-500" : "border-gray-300"
                          }`}
                        >
                          {venue.categories.includes(category) && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <span className="ml-2 text-sm">{formatCategory(category)}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.categories && <p className="mt-1 text-sm text-red-500">{errors.categories}</p>}
              {venue.categories.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {venue.categories.length} category{venue.categories.length !== 1 ? "ies" : "y"} selected
                </p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-teal-500 rounded-full p-2 text-white">
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
                  className={`mt-1 block w-full rounded-md border ${
                    errors.province ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
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
                  className={`mt-1 block w-full rounded-md border ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
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
                  maxLength={100}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.street ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                  placeholder="Enter complete street address (minimum 5 characters)"
                />
                {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                <p className="mt-1 text-xs text-gray-500">{venue.location.street.length}/100 characters</p>
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
                  maxLength={6}
                  pattern="[0-9]{4,6}"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.zipCode ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                  placeholder="4-6 digit postal code"
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
              <div className="bg-teal-500 rounded-full p-2 text-white">
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
                  min="100"
                  max="50000"
                  className={`block w-full pl-12 pr-12 rounded-md border ${
                    errors.basePricePerHour ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                  placeholder="100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">/hour</span>
                </div>
              </div>
              {errors.basePricePerHour && <p className="mt-1 text-sm text-red-500">{errors.basePricePerHour}</p>}
              <p className="mt-1 text-xs text-gray-500">Price range: Rs. 100 - Rs. 50,000 per hour</p>
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
                  max="10000"
                  className={`block w-full pl-10 rounded-md border ${
                    errors.capacity ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50`}
                  placeholder="50"
                />
              </div>
              {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
              <p className="mt-1 text-xs text-gray-500">Maximum capacity: 1 - 10,000 people</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-teal-500 rounded-full p-2 text-white">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Services</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Services (Optional)</label>
              <p className="text-sm text-gray-500 mb-4">
                Select the services you offer with this venue and set your pricing for each service.
              </p>

              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8 text-teal-500 animate-spin" />
                </div>
              ) : servicesData?.services?.length > 0 ? (
                <div className="space-y-4">
                  {servicesData.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                    const selectedService = selectedServices.find((s) => s.serviceId === service.id)

                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 ${
                          isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className={`h-5 w-5 rounded border ${
                                isSelected ? "bg-teal-500 border-teal-500" : "border-gray-300"
                              } flex items-center justify-center`}
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
                              <div className="mt-3 space-y-3">
                                {/* Pricing Category Selection */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                                  <div className="flex space-x-4">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`hourly-${service.id}`}
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "hourly"}
                                        onChange={() => handleServiceCategoryChange(service.id, "hourly")}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                      />
                                      <label
                                        htmlFor={`hourly-${service.id}`}
                                        className="ml-2 block text-sm text-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          Hourly
                                        </div>
                                      </label>
                                    </div>
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`fixed-${service.id}`}
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "fixed"}
                                        onChange={() => handleServiceCategoryChange(service.id, "fixed")}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                      />
                                      <label
                                        htmlFor={`fixed-${service.id}`}
                                        className="ml-2 block text-sm text-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <Tag className="h-4 w-4 mr-1" />
                                          Fixed
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Price Input */}
                                <div>
                                  <label
                                    htmlFor={`price-${service.id}`}
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Your Price {selectedService.category === "hourly" ? "per Hour" : ""} (Rs.)
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
                                      min="50"
                                      max="20000"
                                      className="block w-full pl-12 py-2 rounded-md border border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                                      placeholder="50"
                                    />
                                    {selectedService.category === "hourly" && (
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">/hour</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">Price range: Rs. 50 - Rs. 20,000</p>
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
              {selectedServices.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-teal-500 rounded-full p-2 text-white">
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
                <br />
                <strong>Requirements:</strong> Minimum 400x300 pixels, maximum 10MB, JPEG/PNG/GIF format
              </p>

              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  errors.image ? "border-red-300" : "border-gray-300"
                } border-dashed rounded-md`}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
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
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB • Min: 400x300px</p>
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
              <div className="bg-emerald-500 rounded-full p-2 text-white">
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
                            <div className="text-right">
                              <span>Rs. {service.servicePrice}</span>
                              <span className="text-gray-500 text-xs ml-1">
                                ({service.category === "hourly" ? "per hour" : "fixed"})
                              </span>
                            </div>
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
                    Please review all information carefully. Click the Submit button below to create your venue.
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
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
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
                    ? "bg-teal-600 text-white"
                    : isCompleted
                      ? "bg-emerald-500 text-white"
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
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
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
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <div className="flex items-center">
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </div>
              </button>
            ) : (
              <button
                type="button" // Change from "submit" to "button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
