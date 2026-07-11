import express from "express";
import {
  toggleSaveQuestion,
  getMySavedIds,
  getMySavedQuestions,
} from "../controller/saved.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/toggle/:questionid", auth, toggleSaveQuestion);
router.get("/ids", auth, getMySavedIds);
router.get("/mine", auth, getMySavedQuestions);

export default router;
