import jwt from "jsonwebtoken";
import crypto from "crypto";

export const setUserCookie = async (token, context) => {
  const { res } = context;
  if (!res) {
    throw new Error("Response object not found in context");
  }

  try {
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Adjust sameSite for production
    });
  } catch (err) {
    console.error("Error setting cookie:", err.message);
    throw new Error("Failed to set authentication cookie");
  }
};

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};


export const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
