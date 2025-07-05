// graphql/schema.js

import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String! # "Customer" | "VenueOwner"
    venues: [Venue] # Only for VenueOwners - venues they own
    reviews: [Review] # Reviews the user has written
    bookings: [Booking] # Bookings the user has made
    profileImg: Image
    legalDocImg: Image

    location: Location
    address: String
    esewaId: String
    phone: String
    companyName: String

    verified: Boolean! # Non-nullable verified field
    verificationToken: String
    verificationTokenExpiresAt: String

    roleApprovalStatus: RoleApprovalStatus!
    createdAt: String!
    updatedAt: String!
  }
  enum RoleApprovalStatus {
    PENDING
    APPROVED
    REJECTED
    NONE
  }
  type Transaction {
    transactionId: ID!
    user: User!
    booking: Booking!
    amount: Int!
    status: PaymentStatus!
    venue: Venue!
    esewaReference: String
  }

  type Categories {
    categories: [String!]!
  }

  type Location {
    street: String
    province: Provinces
    zipCode: Int
    city: String
  }

  enum Provinces {
    Koshi
    Madhesh
    Bagmati
    Gandaki
    Lumbini
    Karnali
    Sudurpaschim
  }

  

  type Image {
    public_id: String
    secure_url: String
    asset_id: String
    version: Int
    format: String
    width: Int
    height: Int
    created_at: String
  }

  type Venue {
    id: ID!
    name: String!
    description: String
    location: Location!
    basePricePerHour: Float! # Hourly pricing
    capacity: Int!
    owner: User!
    availability: [Availability!]!
    reviews: [Review!]
    bookings: [Booking]! # Bookings made for this venue
    users: [User!]
    image: Image
    services: [VenueService!]!
    categories: [String!]!

    approvalStatus: VenueApprovalStatus!
  }
  type Services {
    id: ID!
    name: String!
    basePricePerHour: Float
    image: Image!
    venues: [Venue]
    bookings: [Booking]
    users: [User]
  }

  type VenueService {
    serviceId: Services!
    servicePrice: Float
    category: ServiceCategory # "hourly" or "fixed"
  }

  type BookingService {
    serviceId: ID!
    servicePrice: Float
  }

  type Availability {
    date: String! # e.g., "2025-01-25"
    slots: [TimeSlot!]! # Available slots on this date
  }

  type TimeSlot {
    start: String! # e.g., "14:30"
    end: String! # e.g., "17:00"
  }

  type Booking {
    id: ID!
    user: User
    venue: Venue!
    date: String!
    timeslots: [TimeSlot!]!
    totalPrice: Float! # Calculated based on hours booked
    bookingStatus: BookingStatus!
    paymentStatus: PaymentStatus!
    selectedServices: [VenueService!]
    eventType: String! # Type of event (e.g., "Wedding", "Conference")
    phone: String
    additionalNotes: String
    attendees: Int
    createdAt: String!
  }
  enum BookingStatus {
    PENDING # Initial state when booking is created
    APPROVED # Booking has been confirmed by venue
    REJECTED # Booking was declined by venue
    CANCELLED # Booking was cancelled (by customer or venue) after being approved
    COMPLETED # Booking has successfully taken place (past events)
    NO_SHOW # Customer didn't show up for their booking
    RESCHEDULED # Booking was moved to a different date/time
  }

  type Review {
    id: ID!
    user: User!
    venue: Venue!
    rating: Int!
    comment: String!
  }

  type Query {
    me: User
    venues: [Venue!]
    venue(id: ID!): Venue
    bookings: [Booking!]
    booking(id: ID!): Booking
    users: [User!]
    user(id: ID!): User
    reviewsByVenue(venueId: ID!): [Review!]
    reviewsByUser(userId: ID!): [Review!]
    transactions: [Transaction!]
    transaction(id: ID!): Transaction
    myVenues: [Venue!]

    services: [Services!]
    service(id: ID!): Services

    categories: Categories!

    recentBookings(limit: Int): [Booking]
    topVenues(limit: Int): [TopVenue!]!

    pendingVenueOwners: [User!]
    pendingVenues: [Venue!]! # List of all venues awaiting approval
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): Response!
    login(email: String!, password: String!): String! # Returns a JWT
    logout: Response!
    verifyUser(email: String!, code: String!): AuthPayload!
    resendCode(email: String!): Response!
    passwordReset(email: String!): Response!
    newPassword(token: String!, password: String!): Response!

    addVenue(input: venueInput!): Venue!
    updateVenue(id: ID!, input: UpdateVenueInput!): Response!
    bookVenue(input: BookInput!): Booking!
    # approveBooking(bookingId: ID!): Response!
    # rejectBooking(bookingId: ID!): Response!
    # cancelBooking(bookingId: ID!): Booking!

    initiatePayment(bookingId: ID!, amount: Int): TransactionResponse!
    generateSignature(
      total_amount: Float!
      transaction_uuid: String!
      product_code: String!
    ): SignatureResponse!
    verifyPayment(transactionId: String!): Response!

    updateToVenueOwner(input: venueOwnerInput!): Response!
    updateUserDetails(input: UserInput!): Response!

    addReview(input: ReviewInput!): ReviewResponse!
    updateReview(reviewId: ID!, comment: String, rating: Int): ReviewResponse!
    removeReview(reviewId: ID!): DeleteResponse!

    # Admin Only
    deleteUser(userId: ID!): Response!
    removeVenue(venueId: ID!): Response!

    approveVenueOwner(userId: ID!): Response!
    rejectVenueOwner(userId: ID!): Response!

    approveVenue(venueId: ID!): Response! # Admin approves a venue
    rejectVenue(venueId: ID!): Response!

    getUploadSignature(
      tags: [String]
      upload_preset: String!
      uploadFolder: String!
    ): Signature!
    getDeleteSignature(publicId: String!): Signature!

    approveRoleChangeRequest(userId: ID!): Response!
    rejectRoleChangeRequest(userId: ID!, rejectionReason: String!): Response!

    addService(name: String!, image: imageInput!): Response!
    updateService(id: ID!, name: String, image: imageInput): Response!
    deleteService(id: ID!): Response!

    addCategory(category: String!): Categories!
    removeCategory(category: String!): Categories!
    editCategory(oldCategory: String!, newCategory: String!): Categories!
  }

  type TopVenue {
    id: ID!
    name: String!
    totalBookings: Int!
    avgRating: Float!
    location: Location!
    totalRevenue: Float!
    categories: [String!]!
  }
  enum VenueApprovalStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type SignatureResponse {
    signature: String!
    signed_field_names: String!
  }

  type Signature {
    timestamp: Int!
    signature: String!
  }
  type AuthPayload {
    token: String!
    user: User!
  }

  type TransactionResponse {
    response: Response!
    transactionId: ID!
  }

  type UserResponse {
    response: Response!
    user: User!
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

  input BookInput {
    venue: ID!
    date: String!
    start: String! # Start time (e.g., "14:00")
    end: String! # End time (e.g., "16:00")
    additionalNotes: String!
    attendees: Int!
    eventType: String! # Type of event
    phone: String
    selectedServices: [ID!]! # Allow selecting additional services
  }

  input venueInput {
    name: String!
    description: String
    location: locationInput!
    basePricePerHour: Float!
    services: [ServiceInput!]
    capacity: Int!
    image: imageInput!
    categories: [String!]!
  }

  input UserInput {
    name: String!
    esewaId: String
    phone: String
    email: String!
    profileImg: imageInput
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
  }

  input venueOwnerInput {
    name: String!
    email: String!
    profileImg: imageInput!
    legalDocImg: imageInput!
    phone: String!
    address: String!
    esewaId: String!
    companyName: String!
  }

  input ReviewInput {
    comment: String!
    rating: Int!
    venue: ID!
  }

  input UpdateVenueInput {
    name: String
    description: String
    location: locationInput
    basePricePerHour: Float
    services: [ServiceInput]
    capacity: Int
    categories: [String]
    image: imageInput
  }
  input imageInput {
    public_id: String!
    secure_url: String!
    asset_id: String
    version: Int
    format: String
    width: Int
    height: Int
    created_at: String
  }

  input locationInput {
    street: String
    province: Provinces
    zipCode: Int
    city: String
  }

  input ServiceInput {
    serviceId: ID!
    servicePrice: Float!
    category: ServiceCategory! # "hourly" or "fixed"
  }

  enum ServiceCategory {
    hourly
    fixed
  }
`;

export default typeDefs;
