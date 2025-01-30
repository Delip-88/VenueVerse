// graphql/resolvers.js
import Booking from "../models/booking.js";
import Venue from "../models/Venue.js";
import User from "../models/user.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const resolvers = {
  Query: {
    // Fetch all events
    venues: async () => {
      return await Venue.find().populate("owner");
    },

    // Fetch a single event by ID
    venue: async (_, { id }) => {
      return await Venue.findById(id).populate("owner");
    },

    // Fetch all bookings
    bookings: async () => {
      return await Booking.find().populate("venue").populate("user");
    },

    // Fetch a single booking by ID
    booking: async (_, { id }) => {
      return await Booking.findById(id).populate("venue");
    },

    // Fetch all users
    users: async () => {
      return await User.find();
    },

    // Fetch a single user by ID
    user: async (_, { id }) => {
      return await User.findById(id).populate("bookedVenue");
    },
    reviewsByVenue: async (_, { venueId }) => {
      return await Review.find({ venue: venueId }).populate("user");
    },
    reviewsByUser: async (_, { userId }) => {
      return await Review.find({ user: userId }).populate("venue");
    },
  },

  Mutation: {
    // Create a new event
    addVenue: async (
      _,
      { name, description, location, price, features },
      context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const newVenue = new Venue({
        name,
        description,
        location,
        facilities,
        price,
        owner: context.user.id,
      });
      await newVenue.save();
      return newVenue.populate("owner");
    },

    addAvailability: async (_, args) => {
      const { venueId, date, slots } = args;

      try {
        const venue = await Venue.findById(venueId);
        if (!venue) {
          throw new Error("Venue doesn't exist");
        }

        // Check if the date already exists in availability
        const availability = venue.availability || [];
        const dateIndex = availability.findIndex((a) => a.date === date);

        if (dateIndex >= 0) {
          // If the date exists, update slots (avoid duplicates)
          const existingSlots = new Set(availability[dateIndex].slots);
          slots.forEach((slot) => existingSlots.add(slot));
          availability[dateIndex].slots = Array.from(existingSlots);
        } else {
          // If the date doesn't exist, add a new entry
          availability.push({ date, slots });
        }

        venue.availability = availability;
        await venue.save();

        return venue;
      } catch (err) {
        throw new Error(`Error adding availability: ${err.message}`);
      }
    },

    removeAvailability: async (_, args) => {
      const { venueId, date, slots } = args;

      try {
        const venue = await Venue.findById(venueId);
        if (!venue) {
          throw new Error("Venue doesn't exist");
        }

        const availability = venue.availability || [];
        const dateIndex = availability.findIndex((a) => a.date === date);

        if (dateIndex >= 0) {
          // Remove the specified slots from the date
          const remainingSlots = availability[dateIndex].slots.filter(
            (slot) => !slots.includes(slot)
          );

          if (remainingSlots.length > 0) {
            // If there are remaining slots, update the availability for the date
            availability[dateIndex].slots = remainingSlots;
          } else {
            // If no slots remain, remove the entire date
            availability.splice(dateIndex, 1);
          }

          venue.availability = availability;
          await venue.save();

          return venue;
        } else {
          throw new Error("The specified date does not exist in availability");
        }
      } catch (err) {
        throw new Error(`Error removing availability: ${err.message}`);
      }
    },

    // Book tickets for an event
    bookVenue: async (_, args) => {
      const { venue, user, date, slot } = args.input;

      try {
        const venueData = await Venue.findById(venue);
        if (!venueData) {
          throw new Error("Venue not found");
        }

        // Check if the date and slot are available
        const availability = venueData.availability.find(
          (a) => a.date === date
        );
        if (!availability || !availability.slots.includes(slot)) {
          throw new Error("Slot not available");
        }

        // Remove the booked slot from availability
        availability.slots = availability.slots.filter((s) => s !== slot);
        if (availability.slots.length === 0) {
          // Remove the date if no slots remain
          venueData.availability = venueData.availability.filter(
            (a) => a.date !== date
          );
        }
        await venueData.save();

        // Create a new booking
        const booking = new Booking({
          user,
          venue,
          date,
          slot,
          status: "PENDING",
        });
        await booking.save();

        return booking;
      } catch (err) {
        throw new Error(`Error booking venue: ${err.message}`);
      }
    },

    async approveBooking(parent, args) {
      const { bookingId } = args;
      try {
        const booking = await Booking.findOneAndUpdate(
          { _id: bookingId },
          { status: "APPROVED" },
          { new: true }
        );
        if (!booking) {
          throw new Error("Booking not Found");
        }
        return booking;
      } catch (err) {
        throw new Error(`Failed to approve booking: ${err.message}`);
      }
    },

    cancelBooking: async (_, { bookingId }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          throw new Error("Booking not found");
        }

        booking.status = "CANCELLED";
        await booking.save();

        // Add the canceled slot back to the venue's availability
        const venue = await Venue.findById(booking.venue);
        const availability = venue.availability.find(
          (a) => a.date === booking.date
        );

        if (availability) {
          // If the date exists, add the slot back
          availability.slots.push(booking.slot);
        } else {
          // If the date doesn't exist, add a new date entry
          venue.availability.push({
            date: booking.date,
            slots: [booking.slot],
          });
        }

        await venue.save();
        return booking;
      } catch (err) {
        throw new Error(`Error canceling booking: ${err.message}`);
      }
    },

    async addReview(_, args) {
      const { user, comment, rating, venue } = args;

      try {
        // Validate rating range
        if (rating < 1 || rating > 5) {
          throw new Error("Rating must be between 1 and 5.");
        }

        // Create and save the review
        const review = new Review({ user, venue, comment, rating });
        await review.save();

        return {
          response: {
            success: true,
            message: "Review added successfully.",
          },
          review,
        };
      } catch (err) {
        throw new Error(`Error adding review: ${err.message}`);
      }
    },
    async removeReview(_, args) {
      const { reviewId } = args;

      try {
        // Find and delete the review
        const review = await Review.findOneAndDelete({ _id: reviewId });
        if (!review) throw new Error("Review doesn't exist.");

        return {
          response: {
            success: true,
            message: "Review deleted successfully.",
          },
          deletedReview: review,
        };
      } catch (err) {
        throw new Error(`Error removing review: ${err.message}`);
      }
    },

    async updateReview(_, args) {
      const { reviewId, comment, rating } = args;

      try {
        // Validate rating range if provided
        if (rating && (rating < 1 || rating > 5)) {
          throw new Error("Rating must be between 1 and 5.");
        }

        // Find and update the review
        const review = await Review.findOneAndUpdate(
          { _id: reviewId },
          { ...(comment && { comment }), ...(rating && { rating }) }, // Update only provided fields
          { new: true } // Return the updated review
        );

        if (!review) throw new Error("Review not found.");

        return {
          response: {
            success: true,
            message: "Review updated successfully.",
          },
          updatedReview: review,
        };
      } catch (err) {
        throw new Error(`Error updating review: ${err.message}`);
      }
    },

    // Register a new user
    async register(parent, args) {
      const { name, email, password } = args;

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          role: "Customer",
        });

        await newUser.save();

        return {
          message: "Resitered Sucess",
          success: true,
        };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Login user and return a JWT
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return token;
    },

    async deleteUser(_, args) {
      const { userId } = args;
      try {
        const user = await User.findOneAndDelete({ _id: userId });
        if (!user) {
          throw new Error("User doesn't exist");
        }
        return {
          response: {
            message: "User deleted sucessfully",
            success: true,
          },
          user,
        };
      } catch (err) {}
    },
    async deleteVenue(_, args) {
      const { venueId } = args;
      try {
        const venue = await Venue.findOneAndDelete({ _id: venueId });
        if (!venue) {
          throw new Error("venue doesn't exist");
        }
        return {
          response: {
            message: "venue deleted sucessfully",
            success: true,
          },
          venue,
        };
      } catch (err) {}
    },
  },
};

export default resolvers;
