// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // select: false
    },
    bookedVenue: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Event",
      },
    ],

    role: {
      type: String,
      enum: ["VenueOwner", "Customer"],
      default: "Customer",
      required: true,
    },
    image: {
      public_id: String,
      secure_url: String,
      asset_id: String,
      version: Number,
      format: String,
      width: Number,
      height: Number,
      created_at: Date,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiresAt: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Password hashing middleware
// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // This prevents double hashing
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password not found in user document");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
