// This component fetches and displays similar venues based on the current venue using VenueTrie for similarity matching.

import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import { VenueTrie } from "../../components/Functions/venue-trie"
import SimilarVenueCard from "./SimilarVenuesCard"


const SimilarVenues = ({ currentVenue }) => {
  const [similarVenues, setSimilarVenues] = useState([])
  const { data, loading } = useQuery(VENUES)

  useEffect(() => {
    if (data?.venues && currentVenue) {
      // Filter out the current venue from all venues
      const otherVenues = data.venues.filter((venue) => venue.id !== currentVenue.id)

      // Use VenueTrie to find similar venues
      const venueTrie = new VenueTrie()
      const similar = venueTrie.findSimilarVenues(currentVenue, otherVenues, 3)

      setSimilarVenues(similar)
    }
  }, [data, currentVenue])

  if (loading || similarVenues.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-teal-600 mb-4">Similar Venues You May Like</h2>
      <div className="grid grid-cols-1 gap-4">
        {similarVenues.map((venue) => (
          <SimilarVenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  )
}

export default SimilarVenues
