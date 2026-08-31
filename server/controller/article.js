import dotenv from "dotenv";
dotenv.config();
import Article from "../models/article.js";
import user from "../models/auth.js";
import { createNotification } from "./notification.js";
import { safeErrorMessage } from "../utils/safeError.js";

// Auto-calculate read time (avg 200 words/min)
const calcReadTime = (content) => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// GET /article/getall
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .select("-content") // exclude full content from list view
      .sort({ createdAt: -1 });
    res.status(200).json({ data: articles });
  } catch (error) {
    console.error("ARTICLE CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};

// GET /article/get/:id  — also increments view count
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ data: article });
  } catch (error) {
    console.error("ARTICLE CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};

// POST /article/create
export const createArticle = async (req, res) => {
  try {
    console.log("Create article hit");
    console.log("req.userid:", req.userid);
    console.log("req.body:", req.body);
    const { title, content, summary, coverImage, tags } = req.body;

    if (!title || !content || !summary) {
      return res.status(400).json({ message: "Title, content and summary are required" });
    }

    const article = await Article.create({
      title,
      content,
      summary,
      coverImage: coverImage || "",
      authorName: req.body.authorName || "Anonymous",
      authorId: req.userid,
      tags: tags || [],
      readTime: calcReadTime(content),
    });

    res.status(201).json({ data: article });
  } catch (error) {
    console.error("ARTICLE CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};

// DELETE /article/delete/:id
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (article.authorId !== req.userid) {
      return res.status(403).json({ message: "You can only delete your own articles" });
    }
    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("ARTICLE CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};

// POST /article/comment/:id   { body }
export const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Look up the commenter's real name server-side instead of trusting
    // req.body.username — otherwise any logged-in user could post a comment
    // that displays as coming from whatever name they typed, impersonating
    // someone else.
    const commenter = await user.findById(req.userid).select("name");
    if (!commenter) return res.status(404).json({ message: "User not found" });

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            userid: req.userid,
            username: commenter.name,
            body: body.trim(),
          },
        },
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ message: "Article not found" });

    await createNotification({
      userid: article.authorId,
      type: "article_comment",
      fromUserId: req.userid,
      fromUserName: commenter.name,
      message: `${commenter.name} commented on your article "${article.title}"`,
      link: `/articles/${article._id}`,
    });

    res.status(200).json({ data: article });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};

// DELETE /article/comment/:id   { commentId }
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const comment = article.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // IDOR fix: this previously deleted any comment by ID with no check at
    // all — any logged-in user could delete anyone else's comment on any
    // article. Only the comment's own author or an admin can remove it.
    const requester = await user.findById(req.userid).select("role");
    const isOwner = String(comment.userid) === String(req.userid);
    const isAdmin = requester?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    article.comments.pull({ _id: commentId });
    await article.save();

    res.status(200).json({ data: article });
  } catch (error) {
    console.error("ARTICLE CONTROLLER ERROR:", error.message);
    res.status(500).json({ message: safeErrorMessage(error) });
  }
};