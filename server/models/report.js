import mongoose from "mongoose";

const reportSchema = mongoose.Schema({
  targetType: {
    type: String,
    enum: ["question", "answer", "post", "comment", "team", "teammessage"],
    required: true,
  },
  // For "question"/"post"/"team"/"teammessage" this is the doc's own _id.
  // For "answer"/"comment" (embedded subdocs) this is the subdoc _id, and
  // parentId is the question/post they live inside — needed to find them later.
  targetId: { type: String, required: true },
  parentId: { type: String, default: "" },
  reason: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reportedByName: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("report", reportSchema);