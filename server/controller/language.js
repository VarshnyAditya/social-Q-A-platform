import user from "../models/auth.js";
import { sendOTPEmail } from "../utils/mailer.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Masks an email for display, e.g. "john.doe@gmail.com" -> "j***@gmail.com"
// (inlined here since utils/sms.js, which used to own this helper, was removed)
const maskEmail = (email = "") => {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
};

// Every language now verifies via email, same as French previously did.
const requiresEmailVerification = (lang) => true;

// STEP 1: user picks a language -> send OTP via email
export const requestLanguageChangeOTP = async (req, res) => {
  const userId = req.userid;
  const { targetLanguage } = req.body;

  if (!targetLanguage || !SUPPORTED_LANGUAGES.includes(targetLanguage)) {
    return res.status(400).json({ message: "Unsupported or missing target language." });
  }

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found." });

    if (existingUser.preferredLanguage === targetLanguage) {
      return res.status(400).json({ message: "This is already your active language." });
    }

    // All languages verify via email now.
    const useEmail = requiresEmailVerification(targetLanguage);

    if (useEmail && !existingUser.email) {
      return res.status(400).json({ message: "No registered email found for verification." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.findByIdAndUpdate(existingUser._id, {
      otp,
      otpExpiry,
      pendingLanguage: targetLanguage,
    });

    await sendOTPEmail(
      existingUser.email,
      otp,
      existingUser.name,
      "You requested to switch your CodeQuest website language. Use the OTP below to confirm this change:"
    );

    return res.status(200).json({
      message: "OTP sent to your registered email. Enter it to switch language.",
      verificationChannel: "email",
      maskedDestination: maskEmail(existingUser.email),
    });
  } catch (error) {
    console.error("requestLanguageChangeOTP error:", error.message);
    res.status(500).json({ message: "Failed to send verification OTP." });
  }
};

// STEP 2: verify OTP -> actually apply the language switch
export const verifyLanguageChangeOTP = async (req, res) => {
  const userId = req.userid;
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: "OTP is required." });

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found." });

    if (!existingUser.otp || !existingUser.otpExpiry || !existingUser.pendingLanguage) {
      return res.status(400).json({ message: "No pending language change. Please try again." });
    }
    if (new Date() > new Date(existingUser.otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (existingUser.otp !== otp.trim()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    const newLanguage = existingUser.pendingLanguage;

    await user.findByIdAndUpdate(userId, {
      preferredLanguage: newLanguage,
      otp: null,
      otpExpiry: null,
      pendingLanguage: null,
    });

    res.status(200).json({ message: "Language updated successfully.", preferredLanguage: newLanguage });
  } catch (error) {
    console.error("verifyLanguageChangeOTP error:", error.message);
    res.status(500).json({ message: "Failed to verify OTP." });
  }
};