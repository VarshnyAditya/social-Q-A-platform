import message from "../models/chat.js";
import user from "../models/auth.js";

// Friendship is symmetric — both users' `friends` arrays are kept in sync
// when a request is accepted (see social.js: acceptFriendRequest), so
// checking one side is enough.
const areFriends = async (userid, otherid) => {
  const current = await user.findById(userid).select("friends");
  return !!current && current.friends.includes(String(otherid));
};

export const sendMessage = async (req, res) => {
  const fromid = req.userid;
  const { friendid } = req.params;
  const { text } = req.body;

  try {
    if (String(fromid) === String(friendid)) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }
    if (!(await areFriends(fromid, friendid))) {
      return res.status(403).json({ message: "You can only chat with friends" });
    }
    if (!text?.trim() && !req.file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let mediaUrl = "";
    let mediaType = "none";
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const newMessage = await message.create({
      from: String(fromid),
      to: String(friendid),
      text: text?.trim() || "",
      mediaUrl,
      mediaType,
    });

    res.status(200).json({ data: newMessage });
  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// GET /chat/conversation/:friendid — full thread with a friend, oldest first.
// Also marks anything the friend sent me as read, since opening the thread
// is the natural "I've seen this" signal.
export const getConversation = async (req, res) => {
  const userid = req.userid;
  const { friendid } = req.params;

  try {
    if (!(await areFriends(userid, friendid))) {
      return res.status(403).json({ message: "You can only chat with friends" });
    }

    const messages = await message
      .find({
        $or: [
          { from: String(userid), to: String(friendid) },
          { from: String(friendid), to: String(userid) },
        ],
      })
      .sort({ createdAt: 1 });

    await message.updateMany(
      { from: String(friendid), to: String(userid), read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /chat/list — one row per friend, with their last message + unread
// count, so the chat page can render an inbox-style list.
export const getConversationsList = async (req, res) => {
  const userid = req.userid;

  try {
    const currentUser = await user.findById(userid).select("friends");
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const friends = await user.find({ _id: { $in: currentUser.friends } }).select("name _id");

    const list = await Promise.all(
      friends.map(async (friend) => {
        const fid = String(friend._id);
        const lastMessage = await message
          .findOne({
            $or: [
              { from: String(userid), to: fid },
              { from: fid, to: String(userid) },
            ],
          })
          .sort({ createdAt: -1 });
        const unreadCount = await message.countDocuments({
          from: fid,
          to: String(userid),
          read: false,
        });
        return {
          friendId: fid,
          name: friend.name,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                mediaType: lastMessage.mediaType,
                createdAt: lastMessage.createdAt,
                fromMe: lastMessage.from === String(userid),
              }
            : null,
          unreadCount,
        };
      })
    );

    // Most recently active conversations first; friends never messaged
    // fall to the bottom, sorted by name.
    list.sort((a, b) => {
      const at = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bt = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (bt !== at) return bt - at;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({ data: list });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};