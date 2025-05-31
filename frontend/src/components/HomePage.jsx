
import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, X, CheckCircle2 } from "lucide-react"
import VenueCard from "../pages/common/VenueCard"
import { useQuery } from "@apollo/client"
import { VENUES } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [sortBy, setSortBy] = useState("price")
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    capacity: "",
    categories: [],
    province: "",
    services: [],
  })

  const [venues, setVenues] = useState([])
  const { data, error, loading } = useQuery(VENUES)
  const [allServices, setAllServices] = useState([])
  const [allProvinces, setAllProvinces] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])

  useEffect(() => {
    if (data?.venues) {
      // Extract unique services, provinces, and categories
      const services = new Set()
      const provinces = new Set()
      const categories = new Set()

      data.venues.forEach((venue) => {
        // Handle both single category and categories array
        if (Array.isArray(venue.categories) && venue.categories.length > 0) {
          venue.categories.forEach((cat) => categories.add(cat))
        } else if (venue.category) {
          categories.add(venue.category)
        }

        if (venue.location?.province) provinces.add(venue.location.province)
        venue.services?.forEach((service) => {
          if (service.serviceId?.name) services.add(service.serviceId.name)
        })
      })

      setAllServices(Array.from(services).sort())
      setAllProvinces(Array.from(provinces).sort())
      setAllCategories(Array.from(categories).sort())
      setVenues(data.venues)
      applyFiltersAndSort(data.venues)
    }
  }, [data])

  useEffect(() => {
    if (venues.length > 0) {
      applyFiltersAndSort(venues)
    }
  }, [searchTerm, sortBy, filters])

  const applyFiltersAndSort = (venueList) => {
    let filtered = venueList.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((venue) => {
        // Handle venues with categories array
        if (Array.isArray(venue.categories) && venue.categories.length > 0) {
          return filters.categories.some((category) => venue.categories.includes(category))
        }
        // Handle venues with single category for backward compatibility
        else if (venue.category) {
          return filters.categories.includes(venue.category)
        }
        return false
      })
    }

    // Apply province filter
    if (filters.province) {
      filtered = filtered.filter((venue) => venue.location?.province === filters.province)
    }

    // Apply capacity filter
    if (filters.capacity) {
      filtered = filtered.filter((venue) => venue.capacity >= Number(filters.capacity))
    }

    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter((venue) => venue.basePricePerHour >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((venue) => venue.basePricePerHour <= Number(filters.maxPrice))
    }

    // Apply services filter
    if (filters.services.length > 0) {
      filtered = filtered.filter((venue) => {
        if (!venue.services || venue.services.length === 0) return false
        return filters.services.every((serviceName) =>
          venue.services.some((service) => service.serviceId?.name === serviceName),
        )
      })
    }

    // Apply sorting
    if (sortBy === "price") {
      filtered.sort((a, b) => a.basePricePerHour - b.basePricePerHour)
    } else if (sortBy === "priceDesc") {
      filtered.sort((a, b) => b.basePricePerHour - a.basePricePerHour)
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews))
    } else if (sortBy === "capacity") {
      filtered.sort((a, b) => b.capacity - a.capacity)
    }

    setFilteredVenues(filtered)
  }

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleServiceFilter = (service) => {
    setFilters((prev) => {
      const services = [...prev.services]
      if (services.includes(service)) {
        return {
          ...prev,
          services: services.filter((s) => s !== service),
        }
      } else {
        return {
          ...prev,
          services: [...services, service],
        }
      }
    })
  }

  const toggleCategoryFilter = (category) => {
    setFilters((prev) => {
      const categories = [...prev.categories]
      if (categories.includes(category)) {
        return {
          ...prev,
          categories: categories.filter((c) => c !== category),
        }
      } else {
        return {
          ...prev,
          categories: [...categories, category],
        }
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      capacity: "",
      categories: [],
      province: "",
      services: [],
    })
    setSearchTerm("")
  }

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.capacity ||
      filters.categories.length > 0 ||
      filters.province ||
      filters.services.length > 0
    )
  }

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  if (loading) return <Loader />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-lime-50">
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Search and filter section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search venues by name or city..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex gap-2">
            <select
              className="appearance-none bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-teal-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="capacity">Largest Capacity</option>
            </select>
            <button
              className="flex items-center justify-center gap-2 bg-lime-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-200"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <SlidersHorizontal
                size={20}
                className={`transition-transform duration-300 ${isFilterVisible ? "rotate-180" : "rotate-0"}`}
              />
              <span className="hidden sm:inline">{isFilterVisible ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isFilterVisible ? "max-h-[1000px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price Range (per hour)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Minimum Capacity</label>
                <select
                  name="capacity"
                  className="w-full py-2 px-3 border rounded-lg"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Capacity</option>
                  <option value="50">50+ guests</option>
                  <option value="100">100+ guests</option>
                  <option value="200">200+ guests</option>
                  <option value="500">500+ guests</option>
                </select>
              </div>

              {/* Province */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  name="province"
                  className="w-full py-2 px-3 border rounded-lg"
                  value={filters.province}
                  onChange={handleFilterChange}
                >
                  <option value="">All Provinces</option>
                  {allProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategoryFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 flex items-center ${
                      filters.categories.includes(category)
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formatCategory(category)}
                    {filters.categories.includes(category) && <CheckCircle2 className="ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <div className="flex flex-wrap gap-2">
                {allServices.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleServiceFilter(service)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 flex items-center ${
                      filters.services.includes(service)
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {service}
                    {filters.services.includes(service) && <CheckCircle2 className="ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Venues Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Venues</h2>

          {/* Results count */}
          <div className="mb-4 text-gray-600">
            Found {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
          </div>

          {/* Venue grid */}
          {filteredVenues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No venues found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.slice(0, 6).map((venue) => (
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
          )}

          {filteredVenues.length > 6 && (
            <div className="text-center mt-8">
              <button
                className="px-6 py-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                onClick={() => navigate("/Venues")}
              >
                View All Venues
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePage
