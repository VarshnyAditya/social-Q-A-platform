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
// (French always verifies via email; the frontend just doesn't use the
// shared popup UI to collect it — see switchLanguageDirect note below, no
// longer used, kept removed intentionally.)
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

    // French always verifies via email. Everything else prefers mobile, but
    // no real SMS gateway is wired up (see utils/sms.js — placeholder only)
    // and most accounts don't have a phone on file, so fall back to email
    // whenever there's no phone number rather than hard-blocking the flow.
    const hasPhone = Boolean(existingUser.phone);
    const useEmail = requiresEmailVerification(targetLanguage) || !hasPhone;

    if (useEmail && !existingUser.email) {
      return res.status(400).json({ message: "No registered email or phone found for verification." });
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
        "You requested to switch your CodeQuest website language. Use the OTP below to confirm this change:"
      );
    } else {
      await sendOTPSms(existingUser.phone, otp, existingUser.name);
    }

    const isDevMode = process.env.NODE_ENV !== "production";
    // Reveal the OTP alongside the message in dev mode so it's easy to test
    // without needing access to the real email/SMS channel.
    const shouldRevealDevOtp = isDevMode;

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