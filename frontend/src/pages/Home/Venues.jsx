import { useState } from "react";
import { SearchIcon, FilterIcon, StarIcon } from "lucide-react";

// Mock data for venues
const mockVenues = [
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

export default function VenuesPage() {
  const [venues, setVenues] = useState(mockVenues);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [filterByCapacity, setFilterByCapacity] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterVenues(e.target.value, filterByCapacity);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    sortVenues(e.target.value);
  };

  const handleFilterByCapacity = (e) => {
    setFilterByCapacity(e.target.value);
    filterVenues(searchTerm, e.target.value);
  };

  const filterVenues = (search, capacity) => {
    let filtered = mockVenues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(search.toLowerCase()) ||
        venue.location.toLowerCase().includes(search.toLowerCase())
    );

    if (capacity) {
      filtered = filtered.filter(
        (venue) => venue.capacity >= Number.parseInt(capacity)
      );
    }

    setVenues(filtered);
  };

  const sortVenues = (criteria) => {
    const sorted = [...venues].sort((a, b) => {
      if (criteria === "price") return a.price - b.price;
      if (criteria === "rating") return b.rating - a.rating;
      return 0;
    });
    setVenues(sorted);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
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
              onChange={handleSearch}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={handleSort}
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
                onChange={handleFilterByCapacity}
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
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </main>
    </div>
  );
}

function VenueCard({ venue }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={venue.image || "/placeholder.svg"}
        alt={venue.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
        <p className="text-gray-600 mb-2">{venue.location}</p>
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold">${venue.price}/day</p>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>{venue.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-2">Capacity: {venue.capacity} guests</p>
        <div className="flex flex-wrap gap-2">
          {venue.features.map((feature, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
