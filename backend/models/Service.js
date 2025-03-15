import mongoose from 'mongoose'
import { ImageSchema } from './Common.js';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Unique to avoid duplicates
  defaultPricePerHour: { type: Number, required: true },
  image: ImageSchema,
});

const Service = mongoose.model("Service", ServiceSchema);

export default Service