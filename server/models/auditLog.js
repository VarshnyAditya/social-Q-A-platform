import mongoose from "mongoose";

const auditLogSchema = mongoose.Schema({
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "delete_question", "ban_user"
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  details: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("auditlog", auditLogSchema);