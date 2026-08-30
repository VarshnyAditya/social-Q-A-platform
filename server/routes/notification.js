import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controller/notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.patch("/read-all", auth, markAllAsRead);
router.patch("/read/:id", auth, markAsRead);

export default router;