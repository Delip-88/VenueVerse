import { gql } from "@apollo/client";

// Get all bookings (for revenue, bookings, etc.)
export const GET_ALL_BOOKINGS = gql`
  query Bookings {
    bookings {
      id
      venue {
        id
        name
        categories
      }
      date
      totalPrice
      bookingStatus
      paymentStatus
      eventType
      createdAt
      user {
        id
        name
      }
    }
  }
`;

// Get all venues (for venue performance, categories, etc.)
export const GET_ALL_VENUES = gql`
  query Venues {
    venues {
      id
      name
      categories
      basePricePerHour
      capacity
      location {
        city
        province
      }
      approvalStatus
      bookings {
        id
        totalPrice
        bookingStatus
      }
      reviews {
        id
        rating
      }
    }
  }
`;

// Get all users (for user acquisition, etc.)
export const GET_ALL_USERS = gql`
  query Users {
    users {
      id
      name
      createdAt
      role
    }
  }
`;

// Get all reviews (for customer satisfaction)
export const GET_ALL_REVIEWS = gql`
  query Reviews {
    reviewsByVenue(venueId: "") { # You may want to fetch per venue or all
      id
      rating
      comment
    }
  }
`;