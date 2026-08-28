import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Speeds up "conversation between A and B, oldest first" lookups.
messageSchema.index({ from: 1, to: 1, createdAt: 1 });

export default mongoose.model("message", messageSchema);