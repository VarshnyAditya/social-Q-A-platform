import dotenv from "dotenv";
dotenv.config();
import Article from "../models/article.js";

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
    res.status(500).json({ message: "Something went wrong", error: error.message });
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
    res.status(500).json({ message: "Something went wrong", error: error.message });
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
    res.status(500).json({ message: "Something went wrong", error: error.message });
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
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// POST /article/comment/:id   { body }
export const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            userid: req.userid,
            username: req.body.username,
            body: body.trim(),
          },
        },
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ data: article });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// DELETE /article/comment/:id   { commentId }
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ data: article });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
