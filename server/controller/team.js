import team from "../models/team.js";
import teamMessage from "../models/teamMessage.js";
import user from "../models/auth.js";
import points from "../models/points.js";

const MIN_POINTS_TO_CREATE_TEAM = 15;

export const createTeam = async (req, res) => {
  const userid = req.userid;
  const { name, description } = req.body;

  try {
    if (!name?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const creator = await user.findById(userid).select("name");
    if (!creator) return res.status(404).json({ message: "User not found" });

    // Team creation requires a minimum reward-point balance, same Points
    // collection used across points/profile/social — no doc yet just means 0.
    const pointsDoc = await points.findOne({ userid: String(userid) });
    const totalPoints = pointsDoc?.totalPoints ?? 0;
    if (totalPoints < MIN_POINTS_TO_CREATE_TEAM) {
      return res.status(403).json({
        message: `You need at least ${MIN_POINTS_TO_CREATE_TEAM} points to create a team. You currently have ${totalPoints}.`,
      });
    }

    const existing = await team.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "A team with this name already exists" });
    }

    const newTeam = await team.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: String(userid),
      createdByName: creator.name,
      members: [String(userid)],
    });

    res.status(200).json({ data: newTeam });
  } catch (error) {
    console.log("CREATE TEAM ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await team.find().sort({ createdAt: -1 });
    const data = teams.map((t) => ({
      _id: t._id,
      name: t.name,
      description: t.description,
      createdBy: t.createdBy,
      createdByName: t.createdByName,
      memberCount: t.members.length,
      createdAt: t.createdAt,
    }));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });

    const members = await user.find({ _id: { $in: found.members } }).select("name _id");

    res.status(200).json({
      data: {
        _id: found._id,
        name: found.name,
        description: found.description,
        createdBy: found.createdBy,
        createdByName: found.createdByName,
        createdAt: found.createdAt,
        members,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const joinTeam = async (req, res) => {
  const userid = req.userid;
  try {
    const { id } = req.params;
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });

    if (found.members.includes(String(userid))) {
      return res.status(400).json({ message: "You're already a member of this team" });
    }

    found.members.push(String(userid));
    await found.save();

    res.status(200).json({ data: found });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /team/:id/messages — the team's shared thread, oldest first.
// Gated on membership: you must join before you can see anything that's
// been said in the group.
export const getTeamMessages = async (req, res) => {
  const userid = req.userid;
  const { id } = req.params;
  try {
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });
    if (!found.members.includes(String(userid))) {
      return res.status(403).json({ message: "Please join team to access the chat" });
    }

    const messages = await teamMessage.find({ teamId: String(id) }).sort({ createdAt: 1 });
    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /team/:id/send — post to the shared thread; every member sees it.
export const sendTeamMessage = async (req, res) => {
  const userid = req.userid;
  const { id } = req.params;
  const { text } = req.body;
  try {
    const found = await team.findById(id);
    if (!found) return res.status(404).json({ message: "Team not found" });
    if (!found.members.includes(String(userid))) {
      return res.status(403).json({ message: "Join this team to send messages" });
    }
    if (!text?.trim() && !req.file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const sender = await user.findById(userid).select("name");

    let mediaUrl = "";
    let mediaType = "none";
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const newMessage = await teamMessage.create({
      teamId: String(id),
      from: String(userid),
      fromName: sender.name,
      text: text?.trim() || "",
      mediaUrl,
      mediaType,
    });

    res.status(200).json({ data: newMessage });
  } catch (error) {
    console.log("SEND TEAM MESSAGE ERROR:", error.message);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};