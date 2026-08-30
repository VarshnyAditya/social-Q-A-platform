import express from "express";
import { createReport } from "../controller/report.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createReport);

export default router;