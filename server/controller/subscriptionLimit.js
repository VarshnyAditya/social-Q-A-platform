import Subscription from "../models/subscription.js";
import Question from "../models/question.js";
import { PLANS } from "./subscription.js";

// Returns the user's currently active plan key ("free" if none/expired)
export const getActivePlan = async (userid) => {
  const sub = await Subscription.findOne({ userid, status: "active" }).sort({ startDate: -1 });
  if (!sub) return "free";
  if (sub.expiryDate && new Date(sub.expiryDate) < new Date()) return "free";
  return sub.plan;
};

// Returns how many questions this user has posted since midnight (server local time)
export const getTodaysQuestionCount = async (userid) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const count = await Question.countDocuments({
    userid,
    askedon: { $gte: startOfDay },
  });
  return count;
};

// Returns { allowed, limit, used, plan }
export const checkQuestionLimit = async (userid) => {
  const plan = await getActivePlan(userid);
  const limit = PLANS[plan].dailyLimit;
  const used = await getTodaysQuestionCount(userid);
  const allowed = limit === Infinity || used < limit;
  return { allowed, limit, used, plan };
};