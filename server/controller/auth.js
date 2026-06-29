import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generates a random password — only uppercase and lowercase letters, no numbers or special chars
const generatePassword = (length = 12) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += upper.charAt(Math.floor(Math.random() * upper.length));
  }
  return password;
};

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
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
      { expiresIn: "1h" }
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
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name, about, tags } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const forgotPassword = async (req, res) => {
  const { email, customPassword } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // If custom password provided, validate letters only
  if (customPassword) {
    const lettersOnly = /^[a-zA-Z]+$/;
    if (!lettersOnly.test(customPassword)) {
      return res.status(400).json({ message: "Password must contain only uppercase and lowercase letters — no numbers or special characters." });
    }
    if (customPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
  }

  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Check 1-per-day limit
    if (existingUser.lastPasswordReset) {
      const lastReset = new Date(existingUser.lastPasswordReset);
      const now = new Date();
      const isSameDay =
        lastReset.getFullYear() === now.getFullYear() &&
        lastReset.getMonth() === now.getMonth() &&
        lastReset.getDate() === now.getDate();

      if (isSameDay) {
        return res.status(429).json({
          message: "You can use this option only one time per day.",
        });
      }
    }

    // Use custom password if provided, else generate one
    const finalPassword = customPassword || generatePassword(12);
    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    await user.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
      lastPasswordReset: new Date(),
    });

    res.status(200).json({
      message: "Password reset successful",
      newPassword: finalPassword,
      name: existingUser.name,
    });
  } catch (error) {
    console.log("Forgot password error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
