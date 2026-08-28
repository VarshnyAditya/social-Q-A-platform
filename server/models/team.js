import mongoose from "mongoose";

const teamSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  members: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("team", teamSchema);