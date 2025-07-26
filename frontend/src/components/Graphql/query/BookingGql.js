import { gql } from "@apollo/client";

// Fetch all bookings
export const GET_BOOKINGS = gql`
  query GetBookings {
    bookings {
      id
      user {
        id
        name
        email
      }
      venue {
        id
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
      selectedServices {
        serviceId {
          id
          name
        }
        servicePrice
        category
      }
      eventType
      phone
      additionalNotes
      attendees
      createdAt
    }
  }
`;

// Fetch a single booking by ID
export const GET_BOOKING_BY_ID = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      user {
        id
        name
        email
      }
      venue {
        id
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
      selectedServices {
        serviceId {
          id
          name
        }
        servicePrice
        category
      }
      eventType
      phone
      additionalNotes
      attendees
      createdAt
    }
  }
`;
