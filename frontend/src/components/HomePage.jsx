import React, { useContext, useEffect, useState } from "react"
import { Search, SlidersHorizontal, X } from 'lucide-react'
import VenueCard from "../pages/common/VenueCard"
import { AuthContext } from "../middleware/AuthContext"
import { useQuery } from "@apollo/client"
import VENUES from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    minCapacity: "",
    maxCapacity: "",
    facilities: [],
    province: "",
  })

  const [venues, setVenues] = useState([])
  const { data, error, loading } = useQuery(VENUES)

  // Get unique provinces and facilities from venues
  const provinces = [...new Set(venues.map(venue => venue.location.province))].sort()
  const allFacilities = [...new Set(venues.flatMap(venue => venue.facilities))].sort()

  useEffect(() => {
    if (data?.venues) {
      setVenues(data.venues)
    }
  }, [data])

  if (loading) return <Loader />
  if (error) return <div>Error: {error.message}</div>

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }))
  }

  const handleFacilityToggle = (facility) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      facilities: prevFilters.facilities.includes(facility)
        ? prevFilters.facilities.filter((f) => f !== facility)
        : [...prevFilters.facilities, facility],
    }))
  }

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      location: "",
      minCapacity: "",
      maxCapacity: "",
      facilities: [],
      province: "",
    })
    setSearchTerm("")
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice =
      (!filters.minPrice || venue.pricePerHour >= Number(filters.minPrice)) &&
      (!filters.maxPrice || venue.pricePerHour <= Number(filters.maxPrice))

    const matchesLocation =
      !filters.location ||
      venue.location.city.toLowerCase().includes(filters.location.toLowerCase())

    const matchesProvince =
      !filters.province || venue.location.province === filters.province

    const matchesCapacity =
      (!filters.minCapacity || venue.capacity >= Number(filters.minCapacity)) &&
      (!filters.maxCapacity || venue.capacity <= Number(filters.maxCapacity))

    const matchesFacilities =
      filters.facilities.length === 0 ||
      filters.facilities.every((facility) => venue.facilities.includes(facility))

    return (
      matchesSearch &&
      matchesPrice &&
      matchesLocation &&
      matchesProvince &&
      matchesCapacity &&
      matchesFacilities
    )
  })

  const hasActiveFilters =
    Object.values(filters).some((value) => 
      Array.isArray(value) ? value.length > 0 : value !== ""
    ) || searchTerm

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and filter section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search venues by name or city..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <SlidersHorizontal size={20} />
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filter options */}
        {isFilterVisible && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {hasActiveFilters && (
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

              {/* Capacity Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minCapacity"
                    placeholder="Min guests"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.minCapacity}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxCapacity"
                    placeholder="Max guests"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.maxCapacity}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter city name"
                  className="w-full py-2 px-3 border rounded-lg"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              {/* Province Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  name="province"
                  className="w-full py-2 px-3 border rounded-lg"
                  value={filters.province}
                  onChange={handleFilterChange}
                >
                  <option value="">All Provinces</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Facilities */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
              <div className="flex flex-wrap gap-2">
                {allFacilities.map((facility) => (
                  <button
                    key={facility}
                    onClick={() => handleFacilityToggle(facility)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.facilities.includes(facility)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          Found {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}
        </div>

        {/* Venue grid */}
        {filteredVenues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No venues found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                id={venue.id}
                name={venue.name}
                image={venue.image?.secure_url}
                location={venue.location}
                pricePerHour={venue.pricePerHour}
                capacity={venue.capacity}
                facilities={venue.facilities}
                reviews={venue.reviews}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
