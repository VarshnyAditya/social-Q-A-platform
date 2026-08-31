import report from "../models/report.js";
import question from "../models/question.js";
import socialpost from "../models/social.js";
import team from "../models/team.js";
import teamMessage from "../models/teamMessage.js";
import user from "../models/auth.js";
import auditLog from "../models/auditLog.js";
import { deductPoints } from "./points.js";
import { isOnline, ONLINE_THRESHOLD_MS } from "../utils/onlineStatus.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// Records a moderation action; failures here are logged but never block the
// actual admin action from succeeding.
const logAction = async (req, action, targetType, targetId, details = "") => {
  try {
    const admin = await user.findById(req.userid).select("name");
    await auditLog.create({
      adminId: String(req.userid),
      adminName: admin?.name || "Unknown",
      action,
      targetType,
      targetId: String(targetId),
      details,
    });
  } catch (error) {
    console.log("AUDIT LOG ERROR:", error.message);
  }
};

// ---------------- Reports ----------------

// GET /admin/reports?status=pending|resolved|dismissed (status optional)
export const getAllReports = async (req, res) => {
  const { status } = req.query;
  try {
    const filter = status ? { status } : {};
    const reports = await report.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ data: reports });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/reports/:id/status  body: { status: "resolved" | "dismissed" }
export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updated = await report.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Report not found" });
    await logAction(req, `report_${status}`, "report", id, `targetType: ${updated.targetType}`);
    res.status(200).json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------- Content moderation ----------------

// DELETE /admin/question/:id
export const adminDeleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    await logAction(req, "delete_question", "question", id, deleted.questiontitle || "");
    res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /admin/answer/:questionId/:answerId
export const adminDeleteAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  try {
    const questionDoc = await question.findById(questionId);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const answerDoc = questionDoc.answer.find((a) => a._id.toString() === answerId);
    questionDoc.answer.pull(answerId);
    questionDoc.noofanswer = questionDoc.answer.length;
    await questionDoc.save();

    // Same point deduction as the regular delete flow, for consistency.
    if (answerDoc?.userid) {
      await deductPoints(answerDoc.userid, 5, "Answer removed by moderator");
    }

    await logAction(req, "delete_answer", "answer", answerId, `question: ${questionId}`);
    res.status(200).json({ message: "Answer deleted", data: questionDoc });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /admin/post/:id
export const adminDeletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await socialpost.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    await logAction(req, "delete_post", "post", id);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /admin/comment/:postId/:commentId
export const adminDeleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const post = await socialpost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.pull(commentId);
    await post.save();

    await logAction(req, "delete_comment", "comment", commentId, `post: ${postId}`);
    res.status(200).json({ message: "Comment deleted", data: post });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------- Team oversight ----------------

// DELETE /admin/team/:id — also clears out the team's message thread
export const adminDeleteTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Team not found" });
    await teamMessage.deleteMany({ teamId: String(id) });
    await logAction(req, "delete_team", "team", id, deleted.name || "");
    res.status(200).json({ message: "Team deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/team/:id/rename  body: { name }
export const adminRenameTeam = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    if (!name?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }
    const existing = await team.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "A team with this name already exists" });
    }
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });

    const oldName = found.name;
    found.name = name.trim();
    await found.save();

    await logAction(req, "rename_team", "team", id, `"${oldName}" -> "${found.name}"`);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /admin/team/:id/member/:userId
export const adminRemoveTeamMember = async (req, res) => {
  const { id, userId } = req.params;
  try {
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });
    if (String(found.createdBy) === String(userId)) {
      return res.status(400).json({
        message: "Can't remove the team creator — delete the team instead",
      });
    }
    found.members = found.members.filter((m) => String(m) !== String(userId));
    await found.save();

    await logAction(req, "remove_team_member", "team", id, `member: ${userId}`);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /admin/teammessage/:id
export const adminDeleteTeamMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await teamMessage.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    await logAction(req, "delete_teammessage", "teammessage", id, `team: ${deleted.teamId}`);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------- User management ----------------

// GET /admin/users?search=name-or-email
export const getAllUsersAdmin = async (req, res) => {
  const { search } = req.query;
  try {
    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};
    const users = await user
      .find(filter)
      .select("name email role banned joinDate lastActiveAt")
      .sort({ joinDate: -1 })
      .limit(100);
    const withOnlineStatus = users.map((u) => ({
      ...u.toObject(),
      online: isOnline(u.lastActiveAt),
    }));
    res.status(200).json({ data: withOnlineStatus });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /admin/online-count — how many users are currently online, for the
// admin dashboard header.
export const getOnlineCount = async (req, res) => {
  try {
    const count = await user.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - ONLINE_THRESHOLD_MS) },
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/users/:id/ban
export const banUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (String(id) === String(req.userid)) {
      return res.status(400).json({ message: "You can't ban yourself" });
    }
    const found = await user.findByIdAndUpdate(id, { banned: true }, { new: true }).select(
      "name email role banned"
    );
    if (!found) return res.status(404).json({ message: "User not found" });
    await logAction(req, "ban_user", "user", id, found.name);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/users/:id/unban
export const unbanUser = async (req, res) => {
  const { id } = req.params;
  try {
    const found = await user.findByIdAndUpdate(id, { banned: false }, { new: true }).select(
      "name email role banned"
    );
    if (!found) return res.status(404).json({ message: "User not found" });
    await logAction(req, "unban_user", "user", id, found.name);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/users/:id/promote
export const promoteToAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const found = await user.findByIdAndUpdate(id, { role: "admin" }, { new: true }).select(
      "name email role banned"
    );
    if (!found) return res.status(404).json({ message: "User not found" });
    await logAction(req, "promote_admin", "user", id, found.name);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /admin/users/:id/demote
export const demoteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    if (String(id) === String(req.userid)) {
      return res.status(400).json({ message: "You can't demote yourself" });
    }
    const found = await user.findByIdAndUpdate(id, { role: "user" }, { new: true }).select(
      "name email role banned"
    );
    if (!found) return res.status(404).json({ message: "User not found" });
    await logAction(req, "demote_admin", "user", id, found.name);
    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------- Audit log ----------------

// GET /admin/auditlog
export const getAuditLog = async (req, res) => {
  try {
    const logs = await auditLog.find().sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};