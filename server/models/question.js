import mongoose from "mongoose";

const questionschema = mongoose.Schema(
  {
    questiontitle: { type: String, required: true },
    questionbody: { type: String, required: true },
    questiontags: { type: [String], required: true },
    noofanswer: { type: Number, default: 0 },
    upvote: { type: [String], default: [] },
    downvote: { type: [String], default: [] },
    userposted: { type: String },
    userid: { type: String, index: true },
    askedon: { type: Date, default: Date.now },
    answer: [
      {
        answerbody: String,
        useranswered: String,
        userid: String,
        answeredon: { type: Date, default: Date.now },
        upvote: { type: [String], default: [] },
        downvote: { type: [String], default: [] },
        // Tracks the highest upvote-count milestone (5, 10, 15...) already paid out,
        // so toggling votes on/off can never re-trigger the same bonus.
        lastBonusMilestone: { type: Number, default: 0 },
      },
    ],
  },
  { timestamp: true }
);
export default mongoose.model("question", questionschema);