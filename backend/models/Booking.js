// models/Booking.js

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date:{
    type: String,
    required: true
  },
  slot: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING","APPROVED","REJECTED","CANCELLED"],
    default: "PENDING"
  },
  
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
