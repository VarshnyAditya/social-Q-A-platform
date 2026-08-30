import Notification from "../models/notification.js";

// Internal helper — called from other controllers (social, article, chat,
// answer) whenever something notification-worthy happens. Not exposed as
// its own route.
//
// Deliberately swallows its own errors: a failed notification insert should
// never be the reason a friend request / comment / message / answer fails.
export const createNotification = async ({
  userid,
  type,
  fromUserId = "",
  fromUserName = "",
  message,
  link = "",
}) => {
  try {
    if (!userid || !type || !message) return;
    // Never notify someone about their own action (e.g. commenting on your
    // own article, or liking your own post).
    if (fromUserId && String(fromUserId) === String(userid)) return;

    await Notification.create({
      userid: String(userid),
      type,
      fromUserId: fromUserId ? String(fromUserId) : "",
      fromUserName,
      message,
      link,
    });
  } catch (error) {
    console.log("CREATE NOTIFICATION ERROR:", error.message);
  }
};

// GET /notification — latest 30 notifications for the logged-in user.
export const getNotifications = async (req, res) => {
  const userid = req.userid;
  try {
    const notifications = await Notification.find({ userid: String(userid) })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// GET /notification/unread-count — just the badge number, cheap to poll often.
export const getUnreadCount = async (req, res) => {
  const userid = req.userid;
  try {
    const count = await Notification.countDocuments({
      userid: String(userid),
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// PATCH /notification/read/:id — mark one notification as read (e.g. on click).
export const markAsRead = async (req, res) => {
  const userid = req.userid;
  const { id } = req.params;
  try {
    const notification = await Notification.findOne({ _id: id, userid: String(userid) });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    notification.read = true;
    await notification.save();
    res.status(200).json({ data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// PATCH /notification/read-all — "mark all as read" button.
export const markAllAsRead = async (req, res) => {
  const userid = req.userid;
  try {
    await Notification.updateMany(
      { userid: String(userid), read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};