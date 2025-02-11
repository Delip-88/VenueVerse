import mongoose from "mongoose";
import { AvailabilitySchema, ImageSchema, LocationSchema } from "./Common.js";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    pricePerHour: { type: Number, required: true }, // Pricing per hour
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilities: {
      type: [String],
      required: true,
    },
    capacity:{
      type: Number,
      required: true,
    },
    image:{
      type: ImageSchema,
    },
 
    availability: [AvailabilitySchema],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
