import express from "express";
import {
  getMyStats,
  getUserStats,
  searchUsers,
  transferPoints,
} from "../controller/points.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/mystats", auth, getMyStats);
router.get("/user/:userid", getUserStats);
router.get("/search", auth, searchUsers);
router.post("/transfer", auth, transferPoints);

export default router;