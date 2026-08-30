import report from "../models/report.js";
import user from "../models/auth.js";

const VALID_TYPES = ["question", "answer", "post", "comment", "team", "teammessage"];

export const createReport = async (req, res) => {
  const userid = req.userid;
  const { targetType, targetId, parentId, reason } = req.body;

  try {
    if (!VALID_TYPES.includes(targetType)) {
      return res.status(400).json({ message: "Invalid report target" });
    }
    if (!targetId) {
      return res.status(400).json({ message: "Missing target id" });
    }
    if (["answer", "comment"].includes(targetType) && !parentId) {
      return res.status(400).json({ message: "Missing parent id" });
    }
    if (!reason?.trim()) {
      return res.status(400).json({ message: "Please provide a reason" });
    }

    const reporter = await user.findById(userid).select("name");
    if (!reporter) return res.status(404).json({ message: "User not found" });

    // Belt-and-suspenders: check first so we can return a clean 409 message
    // even on databases where the unique index hasn't been built yet.
    const alreadyReported = await report.findOne({
      reportedBy: String(userid),
      targetType,
      targetId: String(targetId),
    });
    if (alreadyReported) {
      return res.status(409).json({ message: "You've already reported this." });
    }

    const newReport = await report.create({
      targetType,
      targetId: String(targetId),
      parentId: parentId ? String(parentId) : "",
      reason: reason.trim(),
      reportedBy: String(userid),
      reportedByName: reporter.name,
    });

    res.status(200).json({ data: newReport });
  } catch (error) {
    // Duplicate-key race: two requests slipped past the findOne check above
    // at the same time. The unique index still stops the double-insert.
    if (error.code === 11000) {
      return res.status(409).json({ message: "You've already reported this." });
    }
    console.log("CREATE REPORT ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// Returns the (targetType, targetId) pairs the current user has already
// reported, so the frontend can show flags as already-red on page load
// instead of only after a fresh report in the current session.
export const getMyReports = async (req, res) => {
  const userid = req.userid;
  try {
    const reports = await report
      .find({ reportedBy: String(userid) })
      .select("targetType targetId -_id");
    res.status(200).json({ data: reports });
  } catch (error) {
    console.log("GET MY REPORTS ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};