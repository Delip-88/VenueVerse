import React, { useState } from "react"
import { Search, LogOut, Home, Calendar, Star, Settings, Menu } from "lucide-react"

const dummyVenues = [
  {
    id: 1,
    name: "Sunset Beach Resort",
    location: "Malibu, CA",
    price: 500,
    rating: 4.5,
    image: "https://picsum.photos/200/300",
  },
  {
    id: 2,
    name: "Mountain View Lodge",
    location: "Aspen, CO",
    price: 350,
    rating: 4.2,
    image: "https://picsum.photos/200/300",
  },
  {
    id: 3,
    name: "City Center Conference Hall",
    location: "New York, NY",
    price: 1000,
    rating: 4.8,
    image: "https://picsum.photos/200/300",
  },
  {
    id: 4,
    name: "Lakeside Retreat",
    location: "Lake Tahoe, NV",
    price: 450,
    rating: 4.6,
    image: "https://picsum.photos/200/300",
  },
  {
    id: 5,
    name: "Historic Downtown Theater",
    location: "Boston, MA",
    price: 800,
    rating: 4.4,
    image: "https://picsum.photos/200/300",
  },
  {
    id: 6,
    name: "Tropical Paradise Resort",
    location: "Honolulu, HI",
    price: 600,
    rating: 4.7,
    image: "https://picsum.photos/200/300",
  },
]

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    minRating: "",
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const filteredVenues = dummyVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice =
      (!filters.minPrice || venue.price >= Number.parseInt(filters.minPrice)) &&
      (!filters.maxPrice || venue.price <= Number.parseInt(filters.maxPrice))
    const matchesLocation = !filters.location || venue.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchesRating = !filters.minRating || venue.rating >= Number.parseFloat(filters.minRating)

    return matchesSearch && matchesPrice && matchesLocation && matchesRating
  })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white w-64 shadow-lg fixed h-full z-20 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <h2 className="text-2xl font-semibold text-gray-800">VenueBook</h2>
          <nav className="mt-8 flex-grow">
            <a href="#" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Home className="mr-3" size={20} />
              Home
            </a>
            <a href="#" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Calendar className="mr-3" size={20} />
              My Bookings
            </a>
            <a href="#" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Star className="mr-3" size={20} />
              Favorites
            </a>
            <a href="#" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Settings className="mr-3" size={20} />
              Settings
            </a>
          </nav>
          <div className="mt-auto flex items-center p-4 border-t">
            <img src="/placeholder-avatar.svg" alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
            <div>
              <p className="text-gray-800 font-medium">John Doe</p>
              <button className="flex items-center text-gray-700 hover:text-gray-900 mt-1">
                <LogOut className="mr-2" size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Search and filter section */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search venues..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filter options */}
          {isFilterVisible && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    placeholder="Min Price"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    placeholder="Max Price"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Location"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Rating
                  </label>
                  <input
                    type="number"
                    id="minRating"
                    name="minRating"
                    step="0.1"
                    placeholder="Min Rating"
                    className="w-full py-2 px-3 border rounded-lg"
                    value={filters.minRating}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Venue grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{venue.name}</h3>
                  <p className="text-gray-600">{venue.location}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-800 font-bold">${venue.price}/day</span>
                    <span className="text-yellow-500 flex items-center">
                      <Star className="mr-1" size={16} fill="currentColor" />
                      {venue.rating}
                    </span>
                  </div>
                  <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage

