import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  friends: { type: [String], default: [] },
  friendRequestsSent: { type: [String], default: [] },
  friendRequestsReceived: { type: [String], default: [] },
  lastPasswordReset: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  // NEW: Task 6 — multi-language support
  preferredLanguage: {
    type: String,
    enum: ["en", "es", "hi", "pt", "zh", "fr"],
    default: "en",
  },
  // holds the language a user is mid-way through switching to, until OTP is verified
  pendingLanguage: { type: String, default: null },
  // NEW: Task 5 — login history for transparency/security
  loginHistory: {
    type: [
      {
        browser: String,
        os: String,
        deviceType: String, // "desktop" | "mobile" | "tablet"
        ip: String,
        loginAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

export default mongoose.model("user", userschema);