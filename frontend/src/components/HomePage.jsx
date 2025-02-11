import React, { useContext, useEffect, useState } from "react";
import { Search } from "lucide-react";
import VenueCard from "../pages/common/VenueCard";
import { AuthContext } from "../middleware/AuthContext";
import { useQuery } from "@apollo/client";
import VENUES from "./Graphql/query/venuesGql";
import Loader from "../pages/common/Loader";

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    minRating: "",
  });

  const [venues, setVenues] = useState([]); // Initialize as an empty array
  const { data, error, loading } = useQuery(VENUES);

  useEffect(() => {
    if (data?.venues) {
      setVenues(data.venues);
    }
  }, [data]);

  if (loading) return <Loader />;

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Filter venues based on search and filter criteria
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      (!filters.minPrice || venue.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || venue.price <= Number(filters.maxPrice));

    const matchesLocation =
      !filters.location ||
      venue.location.city
        .toLowerCase()
        .includes(filters.location.toLowerCase());

    const matchesRating =
      !filters.minRating ||
      (venue.reviews?.rating ?? 0) >= Number(filters.minRating);

    return matchesSearch && matchesPrice && matchesLocation && matchesRating;
  });

  return (
    <>
      {/* Main Content */}
      <div className="flex-1">
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
                {[
                  { label: "Min Price", name: "minPrice", type: "number" },
                  { label: "Max Price", name: "maxPrice", type: "number" },
                  { label: "Location", name: "location", type: "text" },
                  {
                    label: "Min Rating",
                    name: "minRating",
                    type: "number",
                    step: "0.1",
                  },
                ].map(({ label, name, type, step }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      step={step}
                      placeholder={label}
                      className="w-full py-2 px-3 border rounded-lg"
                      value={filters[name]}
                      onChange={handleFilterChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue,index) => (
              <VenueCard 
              key={index}
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
        </main>
      </div>
    </>
  );
};

export default HomePage;
