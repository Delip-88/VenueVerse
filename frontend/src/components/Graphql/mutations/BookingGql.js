import { gql } from "@apollo/client";

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($bookingId: ID!, $status: BookingStatus!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      success
      message
    }
  }
`;
