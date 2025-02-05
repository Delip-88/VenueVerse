import React, { useState } from "react";
import {
  Search,
  LogOut,
  Home,
  Calendar,
  Star,
  Settings,
  Menu,
} from "lucide-react";
import VenueCard from "../pages/common/VenueCard";

const dummyVenues = [
  {
    id: 1,
    name: "Elegant Ballroom",
    location: "Downtown",
    price: 1000,
    rating: 4.8,
    image: "https://picsum.photos/200/300",
    capacity: 200,
    features: ["WiFi", "Catering", "Parking"],
  },
  {
    id: 2,
    name: "Rustic Barn",
    location: "Countryside",
    price: 800,
    rating: 4.6,
    image: "https://picsum.photos/200/300",
    capacity: 150,
    features: ["Outdoor Space", "BBQ Area"],
  },
  {
    id: 3,
    name: "Modern Conference Center",
    location: "Business District",
    price: 1200,
    rating: 4.9,
    image: "https://picsum.photos/200/300",
    capacity: 300,
    features: ["AV Equipment", "Breakout Rooms"],
  },
  {
    id: 4,
    name: "Cozy Art Gallery",
    location: "Arts District",
    price: 600,
    rating: 4.5,
    image: "https://picsum.photos/200/300",
    capacity: 80,
    features: ["Exhibition Space", "Lighting"],
  },
  {
    id: 5,
    name: "Rooftop Lounge",
    location: "City Center",
    price: 1500,
    rating: 4.7,
    image: "https://picsum.photos/200/300",
    capacity: 100,
    features: ["Panoramic View", "Bar"],
  },
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    minRating: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredVenues = dummyVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice =
      (!filters.minPrice || venue.price >= Number.parseInt(filters.minPrice)) &&
      (!filters.maxPrice || venue.price <= Number.parseInt(filters.maxPrice));
    const matchesLocation =
      !filters.location ||
      venue.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesRating =
      !filters.minRating ||
      venue.rating >= Number.parseFloat(filters.minRating);

    return matchesSearch && matchesPrice && matchesLocation && matchesRating;
  });

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 ">
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
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
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
                  <label
                    htmlFor="minPrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="maxPrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="minRating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
              <VenueCard
              name={venue.name}
              image={venue.image}
              location={venue.location}
              price={venue.price}
              rating={venue.rating}
              capacity={venue.capacity}
              features={ venue.features}
            />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
