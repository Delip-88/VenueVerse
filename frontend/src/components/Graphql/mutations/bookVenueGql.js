import { gql } from "@apollo/client";

export const BOOK_VENUE = gql`
  mutation BookVenue($input: BookInput!) {
    bookVenue(input: $input) {
      id
      date
      totalPrice
      bookingStatus
      paymentStatus
      user {
        name
      }
      venue {
        name
      }
      timeslots {
        start
        end
      }
    }
  }
`;
