import mongoose from "mongoose";
import SavedQuestion from "../models/savedQuestion.js";
import Question from "../models/question.js";

// POST /saved/toggle/:questionid
// If the question is already saved by this user, unsave it. Otherwise save it.
// This single toggle endpoint powers both the bookmark button on questions
// and the "Remove from Saved" button on the Saves page.
export const toggleSaveQuestion = async (req, res) => {
  const { questionid } = req.params;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(questionid)) {
    return res.status(400).json({ message: "Question unavailable" });
  }

  try {
    const existing = await SavedQuestion.findOne({ userid, questionid });

    if (existing) {
      await SavedQuestion.deleteOne({ _id: existing._id });
      return res.status(200).json({ saved: false, message: "Removed from saved" });
    }

    const questionExists = await Question.exists({ _id: questionid });
    if (!questionExists) {
      return res.status(404).json({ message: "Question not found" });
    }

    try {
      await SavedQuestion.create({ userid, questionid });
    } catch (err) {
      // Duplicate-key error means a concurrent request already saved it
      // (e.g. a double click) — treat that as a successful save, not an error.
      if (err.code !== 11000) throw err;
    }

    return res.status(200).json({ saved: true, message: "Question saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /saved/ids
// Lightweight list of question ids the logged-in user has saved, used to
// render the bookmark button's filled/unfilled state on question lists
// without fetching the full saved-question details.
export const getMySavedIds = async (req, res) => {
  try {
    const saved = await SavedQuestion.find({ userid: req.userid }).select("questionid -_id");
    return res.status(200).json({ data: saved.map((s) => s.questionid) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /saved/mine
// Full saved-question details (title, body, author, date, answer count) for
// the Saves page, newest-saved first.
export const getMySavedQuestions = async (req, res) => {
  try {
    const saved = await SavedQuestion.find({ userid: req.userid }).sort({ savedon: -1 });
    if (saved.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const questionIds = saved.map((s) => s.questionid);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    const orphanIds = [];
    const result = [];

    for (const s of saved) {
      const q = questionMap.get(String(s.questionid));
      if (!q) {
        // The original question was deleted since it was saved — drop it
        // from the list and clean up the stale saved-record below.
        orphanIds.push(s._id);
        continue;
      }
      result.push({
        _id: q._id,
        questiontitle: q.questiontitle,
        questionbody: q.questionbody,
        questiontags: q.questiontags,
        userposted: q.userposted,
        userid: q.userid,
        askedon: q.askedon,
        noofanswer: q.answer.length,
        savedOn: s.savedon,
      });
    }

    if (orphanIds.length > 0) {
      await SavedQuestion.deleteMany({ _id: { $in: orphanIds } });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
