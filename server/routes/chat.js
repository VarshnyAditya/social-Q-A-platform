import express from "express";
import { sendMessage, getConversation, getConversationsList } from "../controller/chat.js";
import auth from "../middleware/auth.js";
import { chatUpload } from "../middleware/chatUpload.js";

const router = express.Router();

router.get("/list", auth, getConversationsList);
router.get("/conversation/:friendid", auth, getConversation);
router.post("/send/:friendid", auth, chatUpload.single("media"), sendMessage);

// Turns multer errors (oversized file, bad type) into a clean JSON response
// instead of Express's default HTML error page.
router.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large — max size is 30MB." });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  next();
});

export default router;