import express from "express";
import { translateContent } from "../controller/translate.js";

const router = express.Router();

// No auth required — translation of already-public content shouldn't be gated.
router.post("/", translateContent);

export default router;
