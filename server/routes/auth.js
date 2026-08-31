import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  forgotPassword,
  sendOTP,
  verifyOTP,
  resetPasswordAfterOTP,
  getLoginHistory,
  heartbeat,
} from "../controller/auth.js";
import auth from "../middleware/auth.js";
import { loginLimiter, otpSendLimiter, otpVerifyLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", loginLimiter, Login);
// Intentionally public — see the field-projection comment in the controller.
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
// Legacy endpoint: resets a password from just an email, no OTP step, capped
// at once/day server-side. Nothing in the current frontend calls it — the
// live "forgot password" flow is send-otp -> verify-otp -> reset-password-otp
// below. Rate-limited here as a stopgap; flagged separately as its own
// finding since leaving an unauthenticated instant-reset path reachable at
// all is a bigger question than rate limiting can fully answer.
router.post("/forgot-password", loginLimiter, forgotPassword);
router.post("/send-otp", otpSendLimiter, sendOTP);
router.post("/verify-otp", otpVerifyLimiter, verifyOTP);
router.post("/reset-password-otp", resetPasswordAfterOTP);
router.get("/login-history/:id", auth, getLoginHistory);
router.patch("/heartbeat", auth, heartbeat);

export default router;