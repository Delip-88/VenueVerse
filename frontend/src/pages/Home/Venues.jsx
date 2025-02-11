import { useEffect, useState } from "react";
import { SearchIcon, FilterIcon } from "lucide-react";
import VenueCard from "../common/VenueCard";
import { useQuery } from "@apollo/client";
import VENUES from "../../components/Graphql/query/venuesGql";

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [filterByCapacity, setFilterByCapacity] = useState("");
  const [filteredVenues, setFilteredVenues] = useState([]);

  const { data, error, loading } = useQuery(VENUES);

  useEffect(() => {
    if (data?.venues) {
      applyFiltersAndSort(data.venues);
    }
  }, [data, searchTerm, filterByCapacity, sortBy]);

  const applyFiltersAndSort = (venues) => {
    let filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterByCapacity) {
      filtered = filtered.filter((venue) => venue.capacity >= Number(filterByCapacity));
    }

    if (sortBy === "price") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews));
    }

    setFilteredVenues(filtered);
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Venue</h1>

        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search venues..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterByCapacity}
                onChange={(e) => setFilterByCapacity(e.target.value)}
              >
                <option value="">Filter by Capacity</option>
                <option value="50">50+ guests</option>
                <option value="100">100+ guests</option>
                <option value="200">200+ guests</option>
              </select>
              <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVenues.map((venue, index) => (
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
  );
}
