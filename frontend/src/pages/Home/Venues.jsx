"use client"

import { useEffect, useState } from "react"
import { Search, X, SlidersHorizontal } from "lucide-react"
import VenueCard from "../common/VenueCard"
import { useQuery } from "@apollo/client"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import Loader from "../common/Loader"

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("price")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [filteredVenues, setFilteredVenues] = useState([])
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    capacity: "",
    category: "",
    province: "",
    services: [],
  })

  const { data, error, loading } = useQuery(VENUES)
  const [allServices, setAllServices] = useState([])
  const [allProvinces, setAllProvinces] = useState([])
  const [allCategories, setAllCategories] = useState([])

  useEffect(() => {
    if (data?.venues) {
      // Extract unique services, provinces, and categories
      const services = new Set()
      const provinces = new Set()
      const categories = new Set()

      data.venues.forEach((venue) => {
        if (venue.category) categories.add(venue.category)
        if (venue.location?.province) provinces.add(venue.location.province)
        venue.services?.forEach((service) => {
          if (service.serviceId?.name) services.add(service.serviceId.name)
        })
      })

      setAllServices(Array.from(services).sort())
      setAllProvinces(Array.from(provinces).sort())
      setAllCategories(Array.from(categories).sort())

      applyFiltersAndSort(data.venues)
    }
  }, [data])

  useEffect(() => {
    if (data?.venues) {
      applyFiltersAndSort(data.venues)
    }
  }, [searchTerm, sortBy, filters])

  const applyFiltersAndSort = (venues) => {
    let filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((venue) => venue.category === filters.category)
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

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      capacity: "",
      category: "",
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
      filters.category ||
      filters.province ||
      filters.services.length > 0
    )
  }

  if (loading) return <Loader />
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Venue</h1>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search venues by name or city..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <select
              className="appearance-none bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="capacity">Largest Capacity</option>
            </select>
            <button
              className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
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
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
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

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event Category</label>
                <select
                  name="category"
                  className="w-full py-2 px-3 border rounded-lg"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </option>
                  ))}
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

            {/* Services */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <div className="flex flex-wrap gap-2">
                {allServices.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleServiceFilter(service)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      filters.services.includes(service)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          Found {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No venues found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVenues.map((venue, index) => (
              <VenueCard
                key={index}
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
      </main>
    </div>
  )
}

