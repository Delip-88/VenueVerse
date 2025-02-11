import { gql } from "@apollo/client";

const VENUES = gql`
  query Venues {
    venues {
      id
      name
      description
      pricePerHour
      capacity
      facilities
      location {
        street
        province
        city
      }
      reviews {
        id
        rating
        comment
      }
      image {
        public_id
        secure_url
      }
    }
  }
`;
export default VENUES;

export const VENUE_BY_ID = gql`
  query Venue($id: ID!) {
    venue(id: $id) {
        id
        name
        description
        pricePerHour
        capacity
        facilities
        location {
            street
            province
            zipCode
            city
        }
        owner {
            name
            email
        }
        availability {
            date
            slots {
                start
                end
            }
        }
        image {
            public_id
            secure_url
        }
        reviews {
            id
            rating
            comment
            user {
                name
                id
            }
        }
    }
  }
`;
