import {StarIcon} from "lucide-react"

function VenueCard({ name, image, location, price, rating, capacity, features }) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="w-full h-48 object-cover rounded-sm"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{location}</p>
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold">${price}/day</p>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-2">Capacity: {capacity} guests</p>
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
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
    )
  }

  export default VenueCard