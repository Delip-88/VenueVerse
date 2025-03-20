"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronRight,
  ChevronLeft,
  Users,
  MapPin,
  Music,
  Utensils,
  Camera,
  PartyPopper,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react"
import { useQuery } from "@apollo/client"
import { VENUES } from "../Graphql/query/venuesGql"
import VenueCard from "../../pages/common/VenueCard"
import Loader from "../../pages/common/Loader"

const VenueFinderWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    categories: [],
    guestCount: "",
    location: {
      province: "",
      city: "",
    },
    date: "",
    budget: {
      min: "",
      max: "",
    },
    services: [],
    additionalRequirements: "",
  })
  const [cities, setCities] = useState([])
  const [availableServices, setAvailableServices] = useState([])
  const [matchedVenues, setMatchedVenues] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [eventTypes, setEventTypes] = useState([
    { id: "WEDDING", label: "Wedding", icon: <PartyPopper /> },
    { id: "CORPORATE_EVENT_SPACE", label: "Corporate Event", icon: <Users /> },
    { id: "PARTY_HALL", label: "Party Hall", icon: <PartyPopper /> },
    { id: "CONFERENCE_HALL", label: "Conference", icon: <Users /> },
    { id: "CONCERT_HALL", label: "Concert", icon: <Music /> },
    { id: "BANQUET", label: "Banquet", icon: <Utensils /> },
    { id: "OUTDOOR", label: "Outdoor", icon: <MapPin /> },
    { id: "MEETING_ROOM", label: "Meeting Room", icon: <Users /> },
    { id: "SEMINAR_HALL", label: "Seminar Hall", icon: <Users /> },
    { id: "OTHER", label: "Other", icon: <PartyPopper /> },
  ])

  const { data, loading, error } = useQuery(VENUES)

  useEffect(() => {
    if (data?.venues) {
      // Extract provinces from venues
      const uniqueProvinces = [
        ...new Set(data.venues.filter((venue) => venue.location?.province).map((venue) => venue.location.province)),
      ].sort()

      setProvinces(uniqueProvinces)

      // Extract available services
      const services = new Set()
      data.venues.forEach((venue) => {
        venue.services?.forEach((service) => {
          if (service.serviceId?.name) {
            services.add(service.serviceId.name)
          }
        })
      })

      setAvailableServices(
        [...services].map((service) => ({
          id: service,
          name: service,
          icon: getServiceIcon(service),
        })),
      )
    }
  }, [data])

  useEffect(() => {
    // Update cities based on selected province
    if (data?.venues && formData.location.province) {
      const citiesInProvince = [
        ...new Set(
          data.venues
            .filter((venue) => venue.location?.province === formData.location.province && venue.location?.city)
            .map((venue) => venue.location.city),
        ),
      ].sort()

      setCities(citiesInProvince)
    } else {
      setCities([])
    }
  }, [data, formData.location.province])

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes("dj") || name.includes("music")) return <Music />
    if (name.includes("catering") || name.includes("food")) return <Utensils />
    if (name.includes("photo") || name.includes("video")) return <Camera />
    return <PartyPopper />
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const services = [...prev.services]
      if (services.includes(serviceId)) {
        return {
          ...prev,
          services: services.filter((id) => id !== serviceId),
        }
      } else {
        return {
          ...prev,
          services: [...services, serviceId],
        }
      }
    })
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
      const categories = [...prev.categories]
      if (categories.includes(categoryId)) {
        return {
          ...prev,
          categories: categories.filter((id) => id !== categoryId),
        }
      } else {
        return {
          ...prev,
          categories: [...categories, categoryId],
        }
      }
    })
  }

  const findVenues = () => {
    setIsSearching(true)

    // Filter venues based on criteria
    setTimeout(() => {
      if (data?.venues) {
        const filtered = data.venues.filter((venue) => {
          // Match categories
          if (formData.categories.length > 0 && formData.categories[0] !== "OTHER") {
            // If venue has categories array
            if (Array.isArray(venue.categories) && venue.categories.length > 0) {
              // Check if any selected category matches any venue category
              const hasMatchingCategory = formData.categories.some((category) => venue.categories.includes(category))
              if (!hasMatchingCategory) return false
            }
            // For backward compatibility with venues that have a single category
            else if (venue.category) {
              const hasMatchingCategory = formData.categories.includes(venue.category)
              if (!hasMatchingCategory) return false
            }
            // If venue has no category information, filter it out
            else {
              return false
            }
          }

          // Match guest count
          if (formData.guestCount && venue.capacity < Number.parseInt(formData.guestCount)) {
            return false
          }

          // Match province
          if (formData.location.province && venue.location?.province !== formData.location.province) {
            return false
          }

          // Match city if specified
          if (formData.location.city && venue.location?.city !== formData.location.city) {
            return false
          }

          // Match budget
          if (formData.budget.min && venue.basePricePerHour < Number.parseInt(formData.budget.min)) {
            return false
          }

          if (formData.budget.max && venue.basePricePerHour > Number.parseInt(formData.budget.max)) {
            return false
          }

          // Match services
          if (formData.services.length > 0) {
            const venueServices = venue.services?.map((s) => s.serviceId?.name) || []
            const hasAllServices = formData.services.every((service) => venueServices.includes(service))

            if (!hasAllServices) {
              return false
            }
          }

          return true
        })

        // Set matched venues first, then update loading state and step
        setMatchedVenues(filtered)
        setIsSearching(false)

        // Use a small delay to ensure state is updated before changing step
        setTimeout(() => {
          setCurrentStep(7)
          window.scrollTo(0, 0)
        }, 50)
      }
    }, 1000) // Simulate search delay
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // If we're on step 6 (review), automatically trigger the venue search
      if (currentStep === 6) {
        findVenues()
      } else {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const totalSteps = 7

  if (loading) return <Loader />
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What type of event are you planning?</h2>
            <p className="text-gray-600">
              Select the type(s) of venue you're looking for. You can select multiple options.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {eventTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleCategoryToggle(type.id)}
                  className={`p-6 rounded-lg border-2 flex flex-col items-center text-center transition-all ${
                    formData.categories.includes(type.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`p-3 rounded-full mb-3 ${
                      formData.categories.includes(type.id) ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <h3 className="font-medium">{type.label}</h3>
                  {formData.categories.includes(type.id) && (
                    <div className="mt-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mx-auto" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">How many guests are you expecting?</h2>
            <p className="text-gray-600">This helps us find venues with the right capacity for your event.</p>

            <div className="mt-6">
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                id="guestCount"
                name="guestCount"
                min="1"
                placeholder="Enter number of guests"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.guestCount}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[50, 100, 200, 500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setFormData({ ...formData, guestCount: count.toString() })}
                    className={`py-2 px-4 rounded-lg border transition-colors ${
                      formData.guestCount === count.toString()
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {count} guests
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Where would you like to host your event?</h2>
            <p className="text-gray-600">Select the location to find venues in your preferred area.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  id="province"
                  name="location.province"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location.province}
                  onChange={handleInputChange}
                >
                  <option value="">Select a province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <select
                  id="city"
                  name="location.city"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  disabled={!formData.location.province || cities.length === 0}
                >
                  <option value="">All cities in {formData.location.province}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg flex items-start mt-4">
              <MapPin className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="ml-3 text-sm text-blue-700">
                Selecting a specific city will help you find venues closer to your preferred location.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">When is your event?</h2>
            <p className="text-gray-600">Select a date for your event to check venue availability.</p>

            <div className="mt-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg flex items-start mt-4">
              <Clock className="text-yellow-500 mt-1 flex-shrink-0" />
              <p className="ml-3 text-sm text-yellow-700">
                Popular dates get booked quickly. We recommend booking your venue at least 3-6 months in advance for
                large events.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What's your budget?</h2>
            <p className="text-gray-600">Help us find venues that match your budget range.</p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (per hour)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minBudget" className="block text-sm text-gray-500 mb-1">
                    Minimum
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      id="minBudget"
                      name="budget.min"
                      placeholder="Min price"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.budget.min}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="maxBudget" className="block text-sm text-gray-500 mb-1">
                    Maximum
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      id="maxBudget"
                      name="budget.max"
                      placeholder="Max price"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.budget.max}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">What services would you like included?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-3 rounded-lg border flex items-center transition-colors ${
                      formData.services.includes(service.id)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-1 rounded-full mr-2 ${
                        formData.services.includes(service.id) ? "text-blue-500" : "text-gray-400"
                      }`}
                    >
                      {service.icon}
                    </div>
                    <span>{service.name}</span>
                    {formData.services.includes(service.id) && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review your preferences</h2>
            <p className="text-gray-600">Please review your event details before we find your perfect venue.</p>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
              <div className="p-6">
                <h3 className="text-lg font-medium border-b pb-3 mb-4">Event Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue Types:</span>
                    <span className="font-medium">
                      {formData.categories.length > 0
                        ? formData.categories
                            .map((cat) => eventTypes.find((t) => t.id === cat)?.label)
                            .filter(Boolean)
                            .join(", ")
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Guests:</span>
                    <span className="font-medium">{formData.guestCount || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">
                      {formData.location.city
                        ? `${formData.location.city}, ${formData.location.province}`
                        : formData.location.province || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Date:</span>
                    <span className="font-medium">
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Range:</span>
                    <span className="font-medium">
                      {formData.budget.min && formData.budget.max
                        ? `$${formData.budget.min} - $${formData.budget.max} per hour`
                        : formData.budget.min
                          ? `From $${formData.budget.min} per hour`
                          : formData.budget.max
                            ? `Up to $${formData.budget.max} per hour`
                            : "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-600">Requested Services:</span>
                    <div className="mt-2">
                      {formData.services.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.services.map((service) => (
                            <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {service}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No specific services requested</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg flex items-start mt-4">
              <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" />
              <p className="ml-3 text-sm text-green-700">
                You're almost there! Click "Next" to see venues that match your preferences.
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            {isSearching ? (
              <div className="text-center py-12">
                <svg
                  className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <h2 className="text-2xl font-bold mb-2">Finding your perfect venues...</h2>
                <p className="text-gray-600">We're searching for venues that match your preferences.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  {matchedVenues.length > 0
                    ? `We found ${matchedVenues.length} venues for you!`
                    : "No venues match your criteria"}
                </h2>
                <p className="text-gray-600">
                  {matchedVenues.length > 0
                    ? "Here are the venues that match your preferences. Click on any venue to view more details."
                    : "Try adjusting your filters to see more options."}
                </p>

                {matchedVenues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {matchedVenues.map((venue) => (
                      <VenueCard
                        key={venue.id}
                        id={venue.id}
                        name={venue.name}
                        image={venue.image?.secure_url}
                        location={venue.location}
                        basePricePerHour={venue.basePricePerHour}
                        capacity={venue.capacity}
                        services={venue.services}
                        reviews={venue.reviews}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow mt-8">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try broadening your search criteria by adjusting your filters or selecting a different location.
                    </p>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}

                {matchedVenues.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => navigate("/Venues")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View All Venues
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Venue</h1>
          <p className="mt-2 text-gray-600">Answer a few questions to help us find the ideal venue for your event</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {Math.min(currentStep, totalSteps)} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.min(Math.round((currentStep / totalSteps) * 100), 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentStep / totalSteps) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && currentStep !== 7 && (
              <button
                onClick={prevStep}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={() => navigate("/")}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Home
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && formData.categories.length === 0) ||
                  (currentStep === 2 && !formData.guestCount) ||
                  (currentStep === 3 && !formData.location.province) ||
                  isSearching
                }
                className={`ml-auto flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                  (currentStep === 1 && formData.categories.length === 0) ||
                  (currentStep === 2 && !formData.guestCount) ||
                  (currentStep === 3 && !formData.location.province) ||
                  isSearching
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {currentStep === 6 && isSearching ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            ) : null}

            {currentStep === 7 && (
              <button
                onClick={() => setCurrentStep(6)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Summary
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueFinderWizard

