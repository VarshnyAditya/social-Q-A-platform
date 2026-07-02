import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/mailer.js";

const generateLettersPassword = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const Signup = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name, email, password: hashpassword, phone: phone || "",
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const ispasswordcrct = await bcrypt.compare(password, exisitinguser.password);
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags, phone } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name, about, tags, phone: phone || "" } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

// STEP 1: Send OTP
export const sendOTP = async (req, res) => {
  const { identifier } = req.body;

  console.log("=== SEND OTP DEBUG ===");
  console.log("Identifier received:", identifier);

  if (!identifier) {
    return res.status(400).json({ message: "Email or phone number is required" });
  }

  try {
    const existingUser = await user.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    console.log("User found:", existingUser ? existingUser.name : "NOT FOUND");
    console.log("User email:", existingUser ? existingUser.email : "N/A");
    console.log("User phone in DB:", existingUser ? existingUser.phone : "N/A");

    if (!existingUser) {
      return res.status(404).json({ message: "No account found with this email or phone number" });
    }

    // Check 1-per-day limit
    if (existingUser.lastPasswordReset) {
      const lastReset = new Date(existingUser.lastPasswordReset);
      const now = new Date();
      console.log("Last reset date:", lastReset.toDateString());
      console.log("Today:", now.toDateString());
      const isSameDay =
        lastReset.getFullYear() === now.getFullYear() &&
        lastReset.getMonth() === now.getMonth() &&
        lastReset.getDate() === now.getDate();
      console.log("Is same day (limit hit):", isSameDay);
      if (isSameDay) {
        return res.status(429).json({
          message: "You can use this option only one time per day.",
        });
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.findByIdAndUpdate(existingUser._id, { otp, otpExpiry });
    console.log("OTP saved to DB:", otp);

    await sendOTPEmail(existingUser.email, otp, existingUser.name);
    console.log("OTP email sent to:", existingUser.email);

    res.status(200).json({
      message: "OTP sent to your registered email address",
      maskedEmail: existingUser.email.replace(/(.{1})(.*)(@.*)/, (_, a, b, c) =>
        a + "*".repeat(Math.max(b.length, 3)) + c
      ),
      userId: existingUser._id,
    });
  } catch (error) {
    console.log("Send OTP error:", error.message);
    console.log("Full error:", error);
    res.status(500).json({ message: "Failed to send OTP. Check your email config." });
  }
};

// STEP 2: Verify OTP
export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ message: "User ID and OTP are required" });
  }
  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    if (!existingUser.otp || !existingUser.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }
    if (new Date() > new Date(existingUser.otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (existingUser.otp !== otp.trim()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }
    await user.findByIdAndUpdate(userId, { otp: null, otpExpiry: null });
    res.status(200).json({ message: "OTP verified successfully", userId });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// STEP 3: Reset password after OTP verified
export const resetPasswordAfterOTP = async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ message: "User ID and new password are required" });
  }
  const lettersOnly = /^[a-zA-Z]+$/;
  if (!lettersOnly.test(newPassword)) {
    return res.status(400).json({ message: "Password must contain only uppercase and lowercase letters." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    if (existingUser.otp !== null) {
      return res.status(403).json({ message: "OTP not verified. Please verify OTP first." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.findByIdAndUpdate(userId, {
      password: hashedPassword,
      lastPasswordReset: new Date(),
    });
    res.status(200).json({ message: "Password reset successful", name: existingUser.name });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email, customPassword } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (customPassword) {
    const lettersOnly = /^[a-zA-Z]+$/;
    if (!lettersOnly.test(customPassword))
      return res.status(400).json({ message: "Password must contain only uppercase and lowercase letters." });
    if (customPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "No account found with this email" });
    if (existingUser.lastPasswordReset) {
      const lastReset = new Date(existingUser.lastPasswordReset);
      const now = new Date();
      const isSameDay =
        lastReset.getFullYear() === now.getFullYear() &&
        lastReset.getMonth() === now.getMonth() &&
        lastReset.getDate() === now.getDate();
      if (isSameDay) return res.status(429).json({ message: "You can use this option only one time per day." });
    }
    const finalPassword = customPassword || generateLettersPassword(12);
    const hashedPassword = await bcrypt.hash(finalPassword, 12);
    await user.findByIdAndUpdate(existingUser._id, { password: hashedPassword, lastPasswordReset: new Date() });
    res.status(200).json({ message: "Password reset successful", newPassword: finalPassword, name: existingUser.name });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
