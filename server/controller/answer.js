import mongoose from "mongoose";
import question from "../models/question.js";
import { addPoints, deductPoints } from "./points.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  const { answerbody, useranswered, userid } = req.body;

  try {
    const updatequestion = await question.findByIdAndUpdate(
      _id,
      { $addToSet: { answer: [{ answerbody, useranswered, userid }] } },
      { new: true }
    );

    if (!updatequestion) {
      return res.status(404).json({ message: "question not found" });
    }

    // Always derive noofanswer from the real answers array —
    // never trust a client-sent count, that's what was causing it to stick at 0.
    updatequestion.noofanswer = updatequestion.answer.length;
    await updatequestion.save();

    // +5 points for posting an answer
    if (userid) {
      await addPoints(userid, 5, "Posted an answer");
    }

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }

  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) {
      return res.status(404).json({ message: "question not found" });
    }
    // find the answer before deleting, so we know who to deduct points from
    const answerDoc = questionDoc.answer.find(
      (a) => a._id.toString() === answerid
    );

    questionDoc.answer.pull(answerid);
    // Always derive noofanswer from the real answers array
    questionDoc.noofanswer = questionDoc.answer.length;
    await questionDoc.save();

    // -5 points for having answer deleted
    if (answerDoc?.userid) {
      await deductPoints(answerDoc.userid, 5, "Answer was deleted");
    }

    res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

// PATCH /answer/vote/:questionid
// body: { answerid, userid, value: "upvote" | "downvote" }
export const voteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerid, userid, value } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answerIndex = questionDoc.answer.findIndex(
      (a) => a._id.toString() === answerid
    );
    if (answerIndex === -1) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const answerDoc = questionDoc.answer[answerIndex];

    if (!answerDoc.upvote) answerDoc.upvote = [];
    if (!answerDoc.downvote) answerDoc.downvote = [];
    if (!answerDoc.lastBonusMilestone) answerDoc.lastBonusMilestone = 0;

    const alreadyUpvoted = answerDoc.upvote.includes(userid);
    const alreadyDownvoted = answerDoc.downvote.includes(userid);

    if (value === "upvote") {
      if (alreadyDownvoted) {
        answerDoc.downvote = answerDoc.downvote.filter((id) => id !== userid);
      }
      if (alreadyUpvoted) {
        answerDoc.upvote = answerDoc.upvote.filter((id) => id !== userid);
      } else {
        answerDoc.upvote.push(userid);
        const currentCount = answerDoc.upvote.length;
        // Award +5 every time a NEW milestone (5, 10, 15...) is crossed.
        // Comparing against lastBonusMilestone (persisted) means removing and
        // re-adding an upvote can never cross the same milestone twice.
        if (
          currentCount % 5 === 0 &&
          currentCount > answerDoc.lastBonusMilestone &&
          answerDoc.userid
        ) {
          answerDoc.lastBonusMilestone = currentCount;
          await addPoints(answerDoc.userid, 5, `Answer reached ${currentCount} upvotes`);
        }
      }
    } else if (value === "downvote") {
      if (alreadyUpvoted) {
        answerDoc.upvote = answerDoc.upvote.filter((id) => id !== userid);
      }
      if (alreadyDownvoted) {
        answerDoc.downvote = answerDoc.downvote.filter((id) => id !== userid);
        // refund the earlier deduction — removing a downvote should undo its penalty
        if (answerDoc.userid) {
          await addPoints(answerDoc.userid, 5, "Downvote removed");
        }
      } else {
        answerDoc.downvote.push(userid);
        // -5 points for receiving a downvote
        if (answerDoc.userid) {
          await deductPoints(answerDoc.userid, 5, "Answer received a downvote");
        }
      }
    }

    questionDoc.answer[answerIndex] = answerDoc;
    await questionDoc.save();

    res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};
