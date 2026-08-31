import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  // Role-based access for moderation — "admin" unlocks the admin panel.
  role: { type: String, enum: ["user", "admin"], default: "user" },
  // Suspended accounts can't log in — set/cleared from the admin panel.
  banned: { type: Boolean, default: false },
  friends: { type: [String], default: [] },
  friendRequestsSent: { type: [String], default: [] },
  friendRequestsReceived: { type: [String], default: [] },
  // Bumped by a heartbeat ping every ~20s while the app is open in a tab,
  // and on login — "online" is derived by comparing this to now, rather
  // than tracking connections directly (no websockets in this app).
  // IMPORTANT: no `default` here on purpose. If this were defaulted to
  // Date.now, Mongoose fills that default in every time it reads back an
  // existing user document that doesn't have this field stored yet (e.g.
  // every account created before this feature) — making everyone look
  // "just active" even if they've never sent a heartbeat. Leaving it
  // unset means a user with no real activity correctly reads as offline.
  lastActiveAt: { type: Date, default: null },
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