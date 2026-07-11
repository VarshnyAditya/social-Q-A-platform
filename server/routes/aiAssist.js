import express from "express";
import { sendMessage } from "../controller/aiAssist.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", auth, sendMessage);

export default router;