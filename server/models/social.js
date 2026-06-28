import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  commentedon: { type: Date, default: Date.now },
});

const socialPostSchema = mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  likes: { type: [String], default: [] },
  comments: [commentSchema],
  shares: { type: Number, default: 0 },
  postedon: { type: Date, default: Date.now },
});

export default mongoose.model("socialpost", socialPostSchema);
