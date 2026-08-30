import express from "express";
import { createReport, getMyReports } from "../controller/report.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createReport);
router.get("/mine", auth, getMyReports);

export default router;