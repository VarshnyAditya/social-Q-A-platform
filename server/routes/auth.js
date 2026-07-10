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
  verifyLoginOTP,
  getLoginHistory,
} from "../controller/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.post("/forgot-password", forgotPassword);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password-otp", resetPasswordAfterOTP);
router.post("/verify-login-otp", verifyLoginOTP);
router.get("/login-history/:id", auth, getLoginHistory);

export default router;