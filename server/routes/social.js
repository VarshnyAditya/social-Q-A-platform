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

export default router;