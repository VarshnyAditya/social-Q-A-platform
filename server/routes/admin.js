import express from "express";
import {
  getAllReports,
  updateReportStatus,
  adminDeleteQuestion,
  adminDeleteAnswer,
  adminDeletePost,
  adminDeleteComment,
  adminDeleteTeam,
  adminRenameTeam,
  adminRemoveTeamMember,
  adminDeleteTeamMessage,
  getAllUsersAdmin,
  banUser,
  unbanUser,
  promoteToAdmin,
  demoteAdmin,
  getAuditLog,
} from "../controller/admin.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.use(auth, adminAuth);

router.get("/reports", getAllReports);
router.patch("/reports/:id/status", updateReportStatus);

router.delete("/question/:id", adminDeleteQuestion);
router.delete("/answer/:questionId/:answerId", adminDeleteAnswer);
router.delete("/post/:id", adminDeletePost);
router.delete("/comment/:postId/:commentId", adminDeleteComment);
router.delete("/team/:id", adminDeleteTeam);
router.patch("/team/:id/rename", adminRenameTeam);
router.delete("/team/:id/member/:userId", adminRemoveTeamMember);
router.delete("/teammessage/:id", adminDeleteTeamMessage);

router.get("/users", getAllUsersAdmin);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);
router.patch("/users/:id/promote", promoteToAdmin);
router.patch("/users/:id/demote", demoteAdmin);

router.get("/auditlog", getAuditLog);

export default router;