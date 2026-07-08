import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    coverImage: { type: String, default: "" },
    authorName: { type: String, required: true },
    authorId: { type: String, required: true },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 }, // in minutes
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("article", articleSchema);
