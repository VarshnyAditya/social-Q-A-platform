import express from "express";
import {
  createTeam,
  getAllTeams,
  getMyTeamIds,
  getTeam,
  joinTeam,
  getTeamMessages,
  sendTeamMessage,
} from "../controller/team.js";
import auth from "../middleware/auth.js";
import { chatUpload } from "../middleware/chatUpload.js";

const router = express.Router();

router.post("/create", auth, createTeam);
router.get("/getall", getAllTeams);
router.get("/mine", auth, getMyTeamIds);
router.get("/get/:id", getTeam);
router.post("/join/:id", auth, joinTeam);
router.get("/:id/messages", auth, getTeamMessages);
router.post("/:id/send", auth, chatUpload.single("media"), sendTeamMessage);

// Same JSON error handling as chat routes — turns multer errors (oversized
// file, bad type) into a clean response instead of Express's HTML page.
router.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large — max size is 30MB." });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  next();
});

export default router;