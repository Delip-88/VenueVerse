import mongoose from "mongoose";

// Image Schema for reusability
export const ImageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  secure_url: { type: String, required: true },
  asset_id: String,
  version: Number,
  format: String,
  width: Number,
  height: Number,
  created_at: Date,
});

// Location Schema
export const LocationSchema = new mongoose.Schema({
  street: String,
  province: {
    type: String,
    enum: ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpaschim"],
  },
  zipCode: Number,
  city: String,
});