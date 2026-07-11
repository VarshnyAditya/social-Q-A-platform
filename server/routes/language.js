import express from "express";
import { requestLanguageChangeOTP, verifyLanguageChangeOTP } from "../controller/language.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/request-otp", auth, requestLanguageChangeOTP);
router.post("/verify-otp", auth, verifyLanguageChangeOTP);

export default router;
