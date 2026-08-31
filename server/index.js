// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
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
import { generalLimiter } from "./middleware/rateLimit.js";

const app = express();

// Security headers — X-Content-Type-Options, X-Frame-Options (blocks
// clickjacking via iframe embedding), Strict-Transport-Security (enforces
// HTTPS-only at the browser level once served over HTTPS), a default
// Content-Security-Policy, and more, all in one line. Safe to use with
// defaults here since this server only ever returns JSON (or a plain-text
// health check on "/") — it never renders HTML itself, so there's no markup
// or inline scripts of ours that a default CSP could conflict with.
app.use(helmet());

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// CORS allowlist — was previously wide open (cors() with no options reflects
// Access-Control-Allow-Origin for literally any requesting origin). Reads
// allowed origins from FRONTEND_URL (comma-separated if you have more than
// one deployed frontend, e.g. a Vercel prod URL + preview URL), always
// includes localhost:3000 for local dev. Requests with no Origin header
// (curl, Postman, server-to-server, mobile apps) are still allowed through,
// since those aren't the browser-based cross-origin scenario CORS guards
// against — set FRONTEND_URL in your Render/production env to lock this down.
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((o) => o.trim()) : []),
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// Reverse proxies (Render, Vercel) sit in front of this app — without this,
// Express has no way to know which X-Forwarded-For hop to trust, which
// matters for accurate IP logging (see loginHistory) and any future
// IP-based rate limiting.
app.set("trust proxy", 1);

// Baseline rate limit, app-wide. Routes below with their own login/OTP/
// translation limiters get the tighter of the two automatically, since
// express-rate-limit tracks each limiter's own counter independently.
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("CodeQuest is running perfect");
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