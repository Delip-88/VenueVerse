// graphql/resolvers.js
import Booking from "../models/booking.js";
import Venue from "../models/Venue.js";
import User from "../models/user.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailtype.js";
import { generateResetToken, setUserCookie } from "../utils/functions.js";
import { generateToken } from "../utils/functions.js";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { validateEsewaId, validateImage, validateLocation } from "../utils/Validation.js";

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      // ✅ Directly use `user`
      if (!user) {
        throw new Error("Not Authenticated");
      }

      const foundUser = await User.findById(user.id); // Use `.id` from JWT payload
      return foundUser;
    },
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
    addVenue: async (_, args, {user}) => {
      const {
        name,
        description,
        location,
        price,
        facilities,
        capacity,
        availability,
      } = args.input;

      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }
      const newVenue = new Venue({
        name,
        description,
        location,
        facilities,
        price,
        capacity,
        availability,
        owner: context.user.id,
      });
      await newVenue.save();
      return newVenue.populate("owner");
    },

    removeVenue: async (_, args, {user}) => {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }
      const { venueId } = args;
      try {
        const venue = await Venue.findByIdAndDelete(venueId);
        if (!venue) {
          throw new Error("Venue Doesn't exist");
        }

        return { message: "Venue removed Successfully", success: true };
      } catch (err) {
        throw new Error(`Error removing venue: ${err.message}`);
      }
    },

    addAvailability: async (_, args,{user}) => {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }
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

    removeAvailability: async (_, args, {user}) => {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }
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

    bookVenue: async (_, args, { user }) => {
      if (!user) {
        throw new Error("Not Authenticated");
      }
      const { venue, date, slot, price } = args.input;

      try {
        const venueData = await Venue.findById(venue);
        if (!venueData) {
          throw new Error("Venue not found");
        }

        // Check if the date and slot are available
        const availability = venueData.availability.find(
          (a) => a.date === date
        );

        if (!availability) {
          throw new Error("Date not available");
        }

        if (!availability.slots.includes(slot)) {
          throw new Error("Slot not available");
        }

        // Remove the booked slot
        availability.slots = availability.slots.filter((s) => s !== slot);

        // If no slots remain for the date, remove the entire date entry
        if (availability.slots.length === 0) {
          venueData.availability = venueData.availability.filter(
            (a) => a.date !== date
          );
        }

        await venueData.save();

        // Create a new booking
        const booking = new Booking({
          user: user.id,
          venue,
          date,
          slot,
          price,
          status: "PENDING",
        });
        await booking.save();

        return booking;
      } catch (err) {
        throw new Error(`Error booking venue: ${err.message}`);
      }
    },

    approveBooking: async(parent, args,{user})=> {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }
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

    addReview: async (_, args, { user }) => {
      const { comment, rating, venue } = args.input;

      if (!user) {
        throw new Error("Not Authenticated");
      }

      try {
        // Validate rating range
        if (rating < 1 || rating > 5) {
          throw new Error("Rating must be between 1 and 5.");
        }

        // Create and save the review
        const review = new Review({ user: user.id, venue, comment, rating });
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
    removeReview: async (_, args) => {
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

    updateReview: async (_, args) => {
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
    register: async (parent, args, { res }) => {
      const { name, email, password } = args;

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Generate a random 6-digit verification code
        const randTokenGenerate = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const newUser = new User({
          name,
          email,
          password,
          role: "Customer",
          verificationToken: randTokenGenerate.toString(),
          verificationTokenExpiresAt: new Date(
            Date.now() + 15 * 60 * 1000
          ).toISOString(),
        });

        await newUser.save();
        console.log(
          `Sending verification email to: ${newUser.email} with code: ${randTokenGenerate}`
        );
        await sendEmail(
          "email_verification",
          newUser.email,
          "Email Verification",
          randTokenGenerate
        );
        return {
          message: "Email verification sent",
          success: true,
        };
      } catch (err) {
        console.error("Registration Error:", err);
        throw new Error("Registration failed. Please try again.");
      }
    },

    deleteUser: async (_, args) => {
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

    // Login user and return a JWT
    login: async (_, { email, password }, context) => {
      const user = await User.findOne({ email }).select("+password"); // Ensure password is selected

      if (!user) {
        throw new Error("User not found");
      }

      if (!user || user.verified === false) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password); // Direct comparison

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      setUserCookie(token, context);

      return token;
    },

    logout: async(_,__,{res})=>{
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : undefined, // Only set in production
      });
      return { message: "logged out sucessfully", success: true };
    },
    resendCode: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User doesn't exist");
        }
        // Generate a random 6-digit verification code
        const randTokenGenerate = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        user.verificationToken = randTokenGenerate;
        await user.save();

        sendEmail(
          "email_verification",
          email,
          "Email Verification",
          randTokenGenerate
        );
        return { message: "Verification code sended", success: true };
      } catch (err) {
        console.error("Failed to send code,", err.message);
        throw new Error(err.message);
      }
    },

    verifyUser: async (_, { email, code }, context) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists and the verification token matches the provided code
        if (!user || user.verificationToken !== code) {
          console.error("Invalid Code");
          throw new Error("Invalid Code");
        }

        // Check if the verification token has expired
        const tokenExpirationDate = new Date(user.verificationTokenExpiresAt);
        if (tokenExpirationDate < new Date()) {
          console.error("Verification code has expired");
          throw new Error("Verification code has expired");
        }

        // Clear the verification token and update user verification status
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.verified = true;
        user.expiresAt = undefined;

        // Save the updated user
        await user.save();

        // Send welcome email
        await sendEmail(
          "welcome_message",
          user.email,
          "Welcome to the family",
          "",
          user.username
        );

        const token = generateToken(user);
        setUserCookie(token, context);
        // Log the success
        // console.log("User verified and welcome email sent.");

        // Return the user object, excluding the password field
        return {
          token,
          user: { ...user.toObject(), password: undefined },
        };
      } catch (err) {
        // Improved error logging
        console.error("Failed to verify user:", err.message);
        throw new Error(`Verification Failed: ${err.message}`);
      }
    },

    passwordReset: async (_, { email }) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
          console.error("User doesn't exist");
          throw new Error("User doesn't exist");
        }

        // Generate a secure reset token (you should define this function)
        const passwordResetToken = generateResetToken();

        // Set token expiry time (15 minutes from now)
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Update the user with the reset token and expiry
        user.resetToken = passwordResetToken;
        user.resetTokenExpiresAt = new Date(expiresAt); // Store as Date

        await user.save();

        // console.log("User after updating:", user);

        // Send password reset email with the token link
        await sendEmail(
          "password_reset",
          user.email,
          "Password Reset Requested",
          "",
          "",
          `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}` // Reset link
        );

        // console.log("Password reset email sent");
        return {
          message: "Password reset link sended to your email.",
          success: true,
        };
      } catch (err) {
        console.error("Failed to reset password:", err.message);
        throw new Error(`Failed to reset password: ${err.message}`);
      }
    },
    newPassword: async (_, { password, token }, context) => {
      try {
        // Find user by the reset token
        const user = await User.findOne({ resetToken: token });

        if (!user || Date.now() > user.resetTokenExpiresAt) {
          throw new Error("Token is invalid or has expired.");
        }

        // Set the new password
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        user.expiresAt = undefined;
        await user.save();

        // Generate a new token for the user (if you want to log them in immediately)
        const newAuthToken = generateToken(user);

        setUserCookie(newAuthToken, context);
        // Send success email
        sendEmail(
          "password_reset_success",
          user.email,
          "Password Reset Successfully",
          "",
          user.username
        );

        return {
          message: "Password Reset Successfully",
          success: true,
        };
      } catch (err) {
        console.error("Error resetting password:", err.message);
        throw new Error(err.message);
      }
    },
    deleteVenue: async (_, args) => {
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
      } catch (err) {
        throw new Error("Deletion Failed: " + err.message);
      }
    },

    updateToVenueOwner: async (_, { input }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) throw new AuthenticationError("User not authenticated");

        const existingUser = await User.findById(user.id);
        if (!existingUser) throw new UserInputError("User not found");

        // Validate images
        if (!validateImage(input.profileImg) || !validateImage(input.legalDocImg)) {
          throw new UserInputError("Invalid image data");
        }

        // Validate location
        if (!validateLocation(input.location)) {
          throw new UserInputError("Invalid location data");
        }

        // Validate Esewa ID
        if (!validateEsewaId(input.esewaId)) {
          throw new UserInputError("Invalid Esewa ID");
        }

        // Update user fields
        existingUser.name = input.name;
        existingUser.email = input.email;
        existingUser.role = "VenueOwner";
        existingUser.profileImg = input.profileImg;
        existingUser.legalDocImg = input.legalDocImg;
        existingUser.location = input.location;
        existingUser.esewaId = input.esewaId;
        existingUser.companyName = input.companyName;

        await existingUser.save();

        return {
          success: true,
          message: "User upgraded to Venue Owner successfully",
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
  },
  User: {
    async venues(parent) {
      return await Venue.find({ owner: parent._id });
    },
    async reviews(parent) {
      return await Review.find({ user: parent._id });
    },
    async bookings(parent) {
      return await Booking.find({ user: parent._id });
    },
  },

  Booking: {
    async user(parent) {
      // Changed 'users' to 'user'
      return await User.findById(parent.user); // ✅ Fetch user who made this booking
    },
    async venue(parent) {
      // Changed 'venues' to 'venue'
      return await Venue.findById(parent.venue); // ✅ Booking relates to one venue
    },
  },

  Venue: {
    async users(parent) {
      const bookings = await Booking.find({ venue: parent._id });
      const userIds = bookings.map((booking) => booking.user);
      return await User.find({ _id: { $in: userIds } });
    },
    async reviews(parent) {
      return await Review.find({ venue: parent._id });
    },
    async bookings(parent) {
      return await Booking.find({ venue: parent._id });
    },
  },
};

export default resolvers;
