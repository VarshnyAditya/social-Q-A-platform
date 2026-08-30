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
    console.log("CREATE REPORT ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};