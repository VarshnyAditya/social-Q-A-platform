import express from "express";
import { translateContent } from "../controller/translate.js";
import { translateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// No auth required — translation of already-public content shouldn't be
// gated — but it does need its own rate limit since it's unauthenticated.
router.post("/", translateLimiter, translateContent);

export default router;