import express from "express";
import {
  getAllArticles,
  getArticle,
  createArticle,
  deleteArticle,
  addComment,
  deleteComment,
} from "../controller/article.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getall", getAllArticles);
router.get("/get/:id", getArticle);
router.post("/create", auth, createArticle);
router.delete("/delete/:id", auth, deleteArticle);
router.post("/comment/:id", auth, addComment);
router.delete("/comment/:id", auth, deleteComment);

export default router;
