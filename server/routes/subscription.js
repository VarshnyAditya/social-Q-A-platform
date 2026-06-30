import express from "express";
import {
  getPlans,
  getMyStatus,
  createOrder,
  verifyPayment,
} from "../controller/subscription.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/mystatus", auth, getMyStatus);
router.post("/create-order", auth, createOrder);
router.post("/verify-payment", auth, verifyPayment);

export default router;