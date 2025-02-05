import mongoose from "mongoose";
import { ImageSchema, LocationSchema } from "./Common.js";

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
    price: {
      type: Number,
      required: true,
    },
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
 
    availability: [
      {
        date: {
          type: String, // ISO date string (e.g., "2025-01-25")
          required: true,
        },
        slots: {
          type: [String], // Array of available time slots (e.g., ["9:00-12:00", "13:00-16:00"])
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
