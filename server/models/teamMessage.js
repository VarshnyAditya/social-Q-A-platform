import mongoose from "mongoose";

const teamMessageSchema = mongoose.Schema({
  teamId: { type: String, required: true },
  from: { type: String, required: true },
  fromName: { type: String, required: true },
  text: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  createdAt: { type: Date, default: Date.now },
});

// Speeds up "give me this team's thread, oldest first".
teamMessageSchema.index({ teamId: 1, createdAt: 1 });

export default mongoose.model("teammessage", teamMessageSchema);