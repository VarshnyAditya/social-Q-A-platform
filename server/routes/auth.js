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
// Deliberately kept as a route (returning 410, see controller) rather than
// deleted outright, so any old/external caller gets a clear "this is gone"
// instead of a generic 404. See controller/auth.js for why it was removed.
router.post("/forgot-password", loginLimiter, forgotPassword);
router.post("/send-otp", otpSendLimiter, sendOTP);
router.post("/verify-otp", otpVerifyLimiter, verifyOTP);
router.post("/reset-password-otp", resetPasswordAfterOTP);
router.get("/login-history/:id", auth, getLoginHistory);
router.patch("/heartbeat", auth, heartbeat);

export default router;