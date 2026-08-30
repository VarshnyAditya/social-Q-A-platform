import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  // Recipient — the person this notification is for.
  userid: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: [
      "friend_request",
      "friend_accept",
      "article_comment",
      "chat_message",
      "answer",
      "post_like",
      "post_comment",
    ],
    required: true,
  },
  // Who triggered it — omitted (empty) for system-generated notifications, if any get added later.
  fromUserId: { type: String, default: "" },
  fromUserName: { type: String, default: "" },
  // Ready-to-display text, e.g. "Aditya commented on your article".
  message: { type: String, required: true },
  // Frontend route to send the user to when they click the notification.
  link: { type: String, default: "" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Powers "latest notifications for this user" and the unread-count badge.
notificationSchema.index({ userid: 1, createdAt: -1 });
notificationSchema.index({ userid: 1, read: 1 });

export default mongoose.model("notification", notificationSchema);