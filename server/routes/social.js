import express from "express";
import {
  getAllPosts,
  createPost,
  deletePost,
  likePost,
  commentPost,
  sharePost,
  sendFriendRequest,
  acceptFriendRequest,
  getMyFriendData,
  getFriendStatus,
} from "../controller/social.js";
import auth from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/posts", getAllPosts);
router.post("/post", auth, upload.single("media"), createPost);
router.delete("/post/:id", auth, deletePost);
router.patch("/like/:id", auth, likePost);
router.post("/comment/:id", auth, commentPost);
router.patch("/share/:id", auth, sharePost);
router.post("/friend/send", auth, sendFriendRequest);
router.post("/friend/accept", auth, acceptFriendRequest);
router.get("/friend/mydata", auth, getMyFriendData);
router.get("/friend/status/:targetid", auth, getFriendStatus);

// Turns multer errors (oversized file, bad type) into a clean JSON response
// instead of Express's default HTML error page — same pattern used on the
// chat and team routes.
router.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large — max size is 50MB." });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  next();
});

export default router;