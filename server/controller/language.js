import user from "../models/auth.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { sendOTPSms, maskPhone, maskEmail } from "../utils/sms.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Anything other than French verifies via mobile; French verifies via email.
const requiresEmailVerification = (lang) => lang === "fr";

// STEP 1: user picks a language -> send OTP to the right channel
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

    const useEmail = requiresEmailVerification(targetLanguage);

    if (useEmail && !existingUser.email) {
      return res.status(400).json({ message: "No registered email found for verification." });
    }
    if (!useEmail && !existingUser.phone) {
      return res.status(400).json({ message: "No registered mobile number found for verification." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.findByIdAndUpdate(existingUser._id, {
      otp,
      otpExpiry,
      pendingLanguage: targetLanguage,
    });

    if (useEmail) {
      await sendOTPEmail(
        existingUser.email,
        otp,
        existingUser.name,
        "You requested to switch your CodeQuest website language to French. Use the OTP below to confirm this change:"
      );
    } else {
      await sendOTPSms(existingUser.phone, otp, existingUser.name);
    }

    const isDevMode = process.env.NODE_ENV !== "production";
    // Email delivery is real (same mailer used for forgot-password), so never
    // leak the OTP for that channel. Mobile has no real SMS gateway wired up,
    // so the dev-mode reveal stays only for that path.
    const shouldRevealDevOtp = isDevMode && !useEmail;

    return res.status(200).json({
      message: useEmail
        ? "OTP sent to your registered email. Enter it to switch language."
        : "OTP sent to your registered phone number. Enter it to switch language.",
      verificationChannel: useEmail ? "email" : "mobile",
      maskedDestination: useEmail ? maskEmail(existingUser.email) : maskPhone(existingUser.phone),
      ...(shouldRevealDevOtp ? { devOtp: otp } : {}),
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
