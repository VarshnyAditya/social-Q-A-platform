// One-off utility: resets a user's password directly in MongoDB, bypassing
// the OTP-email flow entirely. Useful when the email provider (e.g. a
// MailerSend trial that's hit its recipient limit) can't send the OTP.
//
// Run from inside the server/ folder:
//   node scripts/resetPassword.js <email> <newPassword>
//
// Example:
//   node scripts/resetPassword.js varshneymadhur01@gmail.com MyNewPass123

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import user from "../models/auth.js";

dotenv.config();

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: node scripts/resetPassword.js <email> <newPassword>");
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("Password should be at least 6 characters.");
  process.exit(1);
}

if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL is missing — make sure you're running this from server/ with your .env present.");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const existing = await user.findOne({ email });
    if (!existing) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    // Same hashing scheme as Signup/normal password reset (bcryptjs, 12 rounds).
    existing.password = await bcrypt.hash(newPassword, 12);
    // Clear any stale OTP state left over from failed reset attempts.
    existing.otp = null;
    existing.otpExpiry = null;
    await existing.save();

    console.log(`Password reset successfully for ${existing.name} (${email}).`);
    console.log("You can now log in with the new password.");
  } catch (error) {
    console.error("Error resetting password:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();