// graphql/schema.js

import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String! # "Customer" | "VenueOwner"
    bookedVenue: [Venue] # Venues the user has booked
    venues: [Venue] # Only for VenueOwners - venues they own
    reviews: [Review] # Reviews the user has written
    bookings: [Booking] # Bookings the user has made
  }

  type Venue {
    id: ID!
    name: String!
    description: String
    location: String!
    price: Float!
    capacity: Int!
    facilities: [String!]!
    owner: User!
    availability: [Availability!]!
    reviews: [Review!]
    bookings: [Booking]! # Bookings made for this venue
    users: [User!]
  }

  type Availability {
    date: String! # e.g., "2025-01-25"
    slots: [String!]! # e.g., ["9:00-12:00", "13:00-16:00"]
  }

  type Booking {
    id: ID!
    user: User!
    venue: Venue!
    date: String!
    slot: String!
    status: BookingStatus!
  }

  enum BookingStatus {
    PENDING
    APPROVED
    REJECTED
    CANCELLED
  }

  type Review {
    id: ID!
    user: User!
    venue: Venue!
    rating: Int!
    comment: String!
  }

  type Query {
    me: User!
    venues: [Venue!]
    venue(id: ID!): Venue
    bookings: [Booking!]
    booking(id: ID!): Booking
    users: [User!]
    user(id: ID!): User
    reviewsByVenue(venueId: ID!): [Review!]
    reviewsByUser(userId: ID!): [Review!]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): String! # Returns a JWT
    addVenue(input: venueInput!): Venue!
    removeVenue(venueId: ID!): Response!
    bookVenue(input: bookInput!): Booking!
    approveBooking(bookingId: ID!): Booking!
    cancelBooking(bookingId: ID!): Booking!

    addReview(input: reviewInput!): ReviewResponse!
    updateReview(reviewId: ID!, comment: String, rating: Int): ReviewResponse!
    removeReview(reviewId: ID!): DeleteResponse!

    addAvailability(venueId: ID!, date: String!, slots: [String!]!): Venue!
    removeAvailability(venueId: ID!, date: String!, slots: [String!]!): Venue!

    # Admin Only
    deleteUser(userId: ID!): UserResponse!
    deleteVenue(venueId: ID!): VenueResponse!
  }

  type UserResponse {
    response: Response!
    user: User!
  }

  type VenueResponse {
    response: Response!
    venue: Venue!
  }

  type ReviewResponse {
    response: Response!
    review: Review
    updatedReview: Review
  }

  type DeleteResponse {
    response: Response!
    deletedReview: Review
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Response {
    success: Boolean!
    message: String!
  }

  input bookInput {
    venue: ID!
    date: String!
    slot: String!
    price: Float!
  }

  input venueInput {
    name: String!
    description: String
    location: String!
    price: Float!
    facilities: [String!]
    capacity: Int!
    availability: [slotsInput!]! # ✅ Corrected to an array
  }

  input slotsInput {
    date: String! # e.g., "2025-01-25"
    slots: [String!]! # e.g., ["9:00-12:00", "13:00-16:00"]
  }

  input reviewInput {
    comment: String!
    rating: Int!
    venue: ID!
  }
`;

export default typeDefs;
