import express from "express";
import { requestLanguageChangeOTP, verifyLanguageChangeOTP } from "../controller/language.js";
import auth from "../middleware/auth.js";
import { otpSendLimiter, authedOtpVerifyLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/request-otp", auth, otpSendLimiter, requestLanguageChangeOTP);
router.post("/verify-otp", auth, authedOtpVerifyLimiter, verifyLanguageChangeOTP);

export default router;