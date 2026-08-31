import mongoose from "mongoose";
import user from "../models/auth.js";
import question from "../models/question.js";
import socialpost from "../models/social.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import { sendOTPEmail } from "../utils/mailer.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---- Task 5: login environment detection ----
const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "unknown";
};

// Note: a User-Agent string can only ever tell you "mobile", "tablet", or
// neither — there is no reliable way to distinguish a laptop from a desktop
// from the browser alone, so anything that isn't mobile/tablet is bucketed
// as "desktop".
const parseLoginEnv = (req) => {
  const uaString = req.headers["user-agent"] || "";
  const { browser, os, device } = new UAParser(uaString).getResult();
  return {
    browser: browser.name || "Unknown",
    os: os.name || "Unknown",
    deviceType: device.type === "mobile" || device.type === "tablet" ? device.type : "desktop",
    ip: getClientIp(req),
  };
};

const recordLogin = async (userId, env) => {
  await user.findByIdAndUpdate(userId, {
    lastActiveAt: new Date(),
    $push: {
      loginHistory: {
        $each: [
          {
            browser: env.browser,
            os: env.os,
            deviceType: env.deviceType,
            ip: env.ip,
            loginAt: new Date(),
          },
        ],
        $position: 0, // newest first
        $slice: 50, // cap history so it can't grow unbounded
      },
    },
  });
};

// Fields safe to return to the account owner themselves (login/signup
// response, stored client-side). Deliberately excludes password, otp,
// otpExpiry, loginHistory, friendRequestsSent/Received, and banned —
// none of those are read from the frontend's stored user object, and
// shipping them at all means they'd sit in localStorage on every device
// this account ever logs into, for as long as the user stays logged in.
const SAFE_OWN_PROFILE_FIELDS =
  "name email about tags phone joinDate role friends preferredLanguage";

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
      { expiresIn: "7d", algorithm: "HS256" }
    );
    const safeUser = await user.findById(newuser._id).select(SAFE_OWN_PROFILE_FIELDS);
    res.status(200).json({ data: safeUser, token });
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

    if (exisitinguser.banned) {
      return res.status(403).json({
        message: "Your account has been suspended. Contact support if you believe this is a mistake.",
      });
    }

    const env = parseLoginEnv(req);

    // ---- Direct access for all browsers and devices — OTP is only required
    // at signup and password reset, not on ordinary login. ----
    await recordLogin(exisitinguser._id, env);
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );
    const updatedUser = await user.findById(exisitinguser._id).select(SAFE_OWN_PROFILE_FIELDS);
    res.status(200).json({ data: updatedUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};

// ---- Task 5: verify OTP for a Chrome login, then issue the token ----
// ---- Task 5: login history is only ever visible to its own owner ----
export const getLoginHistory = async (req, res) => {
  const { id } = req.params;
  if (String(req.userid) !== String(id)) {
    return res.status(403).json({ message: "You can only view your own login history" });
  }
  try {
    const existingUser = await user.findById(id).select("loginHistory");
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    const recentHistory = (existingUser.loginHistory || []).slice(0, 5);
    res.status(200).json({ data: recentHistory });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---- Online/offline status: a lightweight ping the frontend calls every
// ~20s while the app is open, so "online" can be derived without websockets.
export const heartbeat = async (req, res) => {
  try {
    await user.findByIdAndUpdate(req.userid, { lastActiveAt: new Date() });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallusers = async (req, res) => {
  try {
    // This endpoint is intentionally public — guests can browse the user
    // directory and the homepage shows a live user count — so the fix here
    // isn't to lock it behind auth, it's to make sure it can never return
    // anything sensitive: no password hash, otp, otpExpiry, email, phone,
    // loginHistory, friendRequests*, role, or banned status. Only the
    // fields the public-facing pages actually render.
    const alluser = await user.find().select("name about tags joinDate");
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
  // Ownership check: this route was only gated on "is logged in", not "is
  // this your own profile" — without this, any authenticated user could
  // edit any other account by ID.
  if (String(req.userid) !== String(_id)) {
    return res.status(403).json({ message: "You can only edit your own profile" });
  }
  try {
    const beforeUpdate = await user.findById(_id).select("name");
    const nameChanged = beforeUpdate && beforeUpdate.name !== name;

    const updateprofile = await user
      .findByIdAndUpdate(
        _id,
        { $set: { name, about, tags, phone: phone || "" } },
        { new: true }
      )
      .select(SAFE_OWN_PROFILE_FIELDS);

    // Name is denormalized (copied) onto every question, answer and social
    // post/comment the user has ever made, so a rename doesn't retroactively
    // show up there unless we backfill those copies too.
    if (nameChanged) {
      const userIdStr = _id.toString();
      await Promise.all([
        question.updateMany({ userid: userIdStr }, { $set: { userposted: name } }),
        question.updateMany(
          { "answer.userid": userIdStr },
          { $set: { "answer.$[elem].useranswered": name } },
          { arrayFilters: [{ "elem.userid": userIdStr }] }
        ),
        socialpost.updateMany({ userid: userIdStr }, { $set: { username: name } }),
        socialpost.updateMany(
          { "comments.userid": userIdStr },
          { $set: { "comments.$[elem].username": name } },
          { arrayFilters: [{ "elem.userid": userIdStr }] }
        ),
      ]);
    }

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
  // Removed: this endpoint reset a password from just an email address, with
  // no OTP verification — an unauthenticated account-takeover path, and it
  // also handed the newly generated plaintext password straight back in the
  // response body. Nothing in the frontend called this route; the real
  // "forgot password" flow is send-otp -> verify-otp -> reset-password-otp.
  // Kept as a 410 (not just deleted outright) in case anything external was
  // still pointed at this path, so it fails loudly and obviously instead of
  // silently 404ing.
  return res.status(410).json({
    message:
      "This endpoint has been removed. Please use the OTP-based reset flow (send-otp -> verify-otp -> reset-password-otp) instead.",
  });
};