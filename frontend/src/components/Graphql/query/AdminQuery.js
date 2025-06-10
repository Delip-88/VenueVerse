import { gql } from "@apollo/client";

const RECENT_BOOKINGS = gql`
  query recentBookings {
    recentBookings {
      id
      user {
        name
      }
      venue {
        name
      }
      date
      timeslots {
        start
        end
      }
      totalPrice
      bookingStatus
      paymentStatus
      createdAt
    }
  }
`;

const TOP_VENUES = gql`
  query topVenues {
    topVenues {
      id
      name
      totalBookings
      avgRating
      totalRevenue
      categories
      location {
        city
        province
        zipCode
        street
      }
    }
  }
`;
const PENDING_VENUE_OWNER = gql`
  query pendingVenueOwners {
    pendingVenueOwners {
      name
      email
      phone
      companyName
      address
      createdAt
      updatedAt
    }
  }
`;

const PENDING_VENUE_APPROVAL = gql`
  query PendingVenues {
    pendingVenues {
      id
      name
      description
      basePricePerHour
      capacity
      categories
      approvalStatus
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
      image {
        secure_url
        public_id
      }
    }
  }
`;


 const GET_ALL_SERVICES = gql`
  query GetAllServices {
    services {
        id
        name
        image {
          public_id
          secure_url
        }
    }
  }
`

 const ADD_SERVICE = gql`
  mutation addService($name: String!, $image: imageInput!) {
    addService(name: $name, image: $image) {
      success
      message
    }
  }
`

 const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      success
      message
    }
  }
`


export {
  RECENT_BOOKINGS,
  TOP_VENUES,
  PENDING_VENUE_OWNER,
  PENDING_VENUE_APPROVAL,
  GET_ALL_SERVICES,
  ADD_SERVICE,
  DELETE_SERVICE

};
