import mongoose from "mongoose";
import {
  AvailabilitySchema,
  ImageSchema,
  LocationSchema,
  ServiceSchema,
} from "./Common.js";

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
    basePricePerHour: { type: Number, required: true }, // Pricing per hour
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        servicePrice: { type: Number, default: 0 ,required: true},
        category: {
          type: String,
          enum: ["hourly", "fixed"],
          required: true,
        },

      },
    ],
    capacity: {
      type: Number,
      required: true,
    },
    approvalStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" }, // NEW FIELD

    categories: {
      type: [String],
      required: true,
    },

    image: {
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
