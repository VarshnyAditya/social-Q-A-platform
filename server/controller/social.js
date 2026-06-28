import socialpost from "../models/social.js";
import user from "../models/auth.js";

const getPostLimit = (friendCount) => {
  if (friendCount === 0) return 0;
  if (friendCount === 1) return 1;
  if (friendCount === 2) return 2;
  if (friendCount === 3) return 3;
  if (friendCount === 4) return 4;
  if (friendCount === 5) return 5;
  if (friendCount === 6) return 6;
  if (friendCount === 7) return 7;
  if (friendCount === 8) return 8;
  if (friendCount === 9) return 9;
  if (friendCount > 10) return Infinity;
  return 9;
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await socialpost.find().sort({ postedon: -1 });
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createPost = async (req, res) => {
  const userid = req.userid;
  const { content } = req.body;

  try {
    const currentUser = await user.findById(userid);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const friendCount = currentUser.friends.length;
    const limit = getPostLimit(friendCount);

    if (limit === 0) {
      return res.status(403).json({
        message: "You need at least 1 friend to post. Connect with others first!",
      });
    }

    if (limit !== Infinity) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const postsToday = await socialpost.countDocuments({
        userid: String(userid),
        postedon: { $gte: startOfDay },
      });
      if (postsToday >= limit) {
        return res.status(403).json({
          message: `You've reached your daily limit of ${limit} post(s). Add more friends to post more!`,
        });
      }
    }

    let mediaUrl = "";
    let mediaType = "none";
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const newPost = await socialpost.create({
      userid,
      username: currentUser.name,
      content,
      mediaUrl,
      mediaType,
    });

    res.status(200).json({ data: newPost });
  } catch (error) {
    console.log("POST ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const userid = req.userid;
  try {
    const post = await socialpost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const alreadyLiked = post.likes.includes(String(userid));
    if (alreadyLiked) {
      post.likes = post.likes.filter((uid) => uid !== String(userid));
    } else {
      post.likes.push(String(userid));
    }
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const userid = req.userid;
  const { text } = req.body;
  try {
    const currentUser = await user.findById(userid);
    const post = await socialpost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ userid: String(userid), username: currentUser.name, text });
    await post.save();
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const sharePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await socialpost.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendFriendRequest = async (req, res) => {
  const senderid = req.userid;
  const { targetid } = req.body;
  try {
    if (String(senderid) === String(targetid))
      return res.status(400).json({ message: "Cannot add yourself" });
    const sender = await user.findById(senderid);
    const target = await user.findById(targetid);
    if (!sender || !target) return res.status(404).json({ message: "User not found" });
    if (sender.friends.includes(String(targetid)))
      return res.status(400).json({ message: "Already friends" });
    if (sender.friendRequestsSent.includes(String(targetid)))
      return res.status(400).json({ message: "Request already sent" });
    sender.friendRequestsSent.push(String(targetid));
    target.friendRequestsReceived.push(String(senderid));
    await sender.save();
    await target.save();
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const userid = req.userid;
  const { requesterid } = req.body;
  try {
    const currentUser = await user.findById(userid);
    const requester = await user.findById(requesterid);
    if (!currentUser || !requester)
      return res.status(404).json({ message: "User not found" });
    if (!currentUser.friendRequestsReceived.includes(String(requesterid)))
      return res.status(400).json({ message: "No request from this user" });
    currentUser.friends.push(String(requesterid));
    requester.friends.push(String(userid));
    currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(
      (id) => id !== String(requesterid)
    );
    requester.friendRequestsSent = requester.friendRequestsSent.filter(
      (id) => id !== String(userid)
    );
    await currentUser.save();
    await requester.save();
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyFriendData = async (req, res) => {
  const userid = req.userid;
  try {
    const currentUser = await user
      .findById(userid)
      .select("friends friendRequestsReceived friendRequestsSent name");
    const friendDetails = await user
      .find({ _id: { $in: currentUser.friends } })
      .select("name _id");
    const requestDetails = await user
      .find({ _id: { $in: currentUser.friendRequestsReceived } })
      .select("name _id");
    res.status(200).json({
      data: {
        friends: friendDetails,
        requests: requestDetails,
        friendCount: currentUser.friends.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
