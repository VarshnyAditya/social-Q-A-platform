// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import socialroutes from "./routes/social.js";
import subscriptionroutes from "./routes/subscription.js";
import pointsroutes from "./routes/points.js";
import articleroutes from "./routes/article.js";
import airoutes from "./routes/aiAssist.js";
import savedroutes from "./routes/saved.js";
import languageroutes from "./routes/language.js";
import translateroutes from "./routes/translate.js";
import chatroutes from "./routes/chat.js";
import teamroutes from "./routes/team.js";
import reportroutes from "./routes/report.js";
import adminroutes from "./routes/admin.js";
import notificationroutes from "./routes/notification.js";

const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});

app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);
app.use("/social", socialroutes);
app.use("/subscription", subscriptionroutes);
app.use("/points", pointsroutes);
app.use("/article", articleroutes);
app.use("/ai", airoutes);
app.use("/saved", savedroutes);
app.use("/language", languageroutes);
app.use("/translate", translateroutes);
app.use("/chat", chatroutes);
app.use("/team", teamroutes);
app.use("/report", reportroutes);
app.use("/admin", adminroutes);
app.use("/notification", notificationroutes);

const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });