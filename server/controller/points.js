import dotenv from "dotenv";
dotenv.config();

import Points from "../models/points.js";
import User from "../models/auth.js";

// ---- helper: get or create a points doc for a user ----
const getOrCreate = async (userid) => {
  let doc = await Points.findOne({ userid });
  if (!doc) {
    doc = await Points.create({ userid, totalPoints: 0, transactions: [] });
  }
  return doc;
};

// ---- helper: add points ----
export const addPoints = async (userid, amount, reason) => {
  const doc = await getOrCreate(userid);
  doc.totalPoints += amount;
  doc.transactions.push({ type: "earned", amount, reason });
  await doc.save();
};

// ---- helper: deduct points (floor at 0) ----
export const deductPoints = async (userid, amount, reason) => {
  const doc = await getOrCreate(userid);
  doc.totalPoints = Math.max(0, doc.totalPoints - amount);
  doc.transactions.push({ type: "deducted", amount, reason });
  await doc.save();
};

// GET /points/mystats  — logged in user's balance + history
export const getMyStats = async (req, res) => {
  try {
    const doc = await getOrCreate(req.userid);
    res.status(200).json({
      totalPoints: doc.totalPoints,
      transactions: doc.transactions.slice().reverse(), // newest first
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// GET /points/user/:userid  — any user's balance (for profile display)
export const getUserStats = async (req, res) => {
  try {
    const doc = await getOrCreate(req.params.userid);
    res.status(200).json({ totalPoints: doc.totalPoints });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// GET /points/search?name=xxx  — search users by name for transfer
export const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Enter at least 2 characters to search" });
    }
    const users = await User.find({
      name: { $regex: name.trim(), $options: "i" },
      _id: { $ne: req.userid }, // exclude self
    }).select("_id name email");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// POST /points/transfer  — { toUserid, amount }
export const transferPoints = async (req, res) => {
  try {
    const { toUserid, amount } = req.body;
    const fromUserid = req.userid;

    if (!toUserid || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid transfer details" });
    }

    if (toUserid === fromUserid) {
      return res.status(400).json({ message: "You cannot transfer points to yourself" });
    }

    const senderDoc = await getOrCreate(fromUserid);

    // ---- Transfer blocked if sender has 10 or fewer points ----
    if (senderDoc.totalPoints <= 10) {
      return res.status(403).json({
        message: `You need more than 10 points to transfer. Your current balance is ${senderDoc.totalPoints} points.`,
      });
    }

    if (senderDoc.totalPoints < amount) {
      return res.status(403).json({
        message: `Insufficient points. You have ${senderDoc.totalPoints} points but tried to transfer ${amount}.`,
      });
    }

    const toUser = await User.findById(toUserid);
    if (!toUser) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    const fromUser = await User.findById(fromUserid);

    // ---- Deduct from sender ----
    senderDoc.totalPoints -= amount;
    senderDoc.transactions.push({
      type: "transferred_out",
      amount,
      reason: `Transferred to ${toUser.name}`,
      relatedUser: toUserid,
    });
    await senderDoc.save();

    // ---- Credit to receiver ----
    const receiverDoc = await getOrCreate(toUserid);
    receiverDoc.totalPoints += amount;
    receiverDoc.transactions.push({
      type: "transferred_in",
      amount,
      reason: `Received from ${fromUser.name}`,
      relatedUser: fromUserid,
    });
    await receiverDoc.save();

    res.status(200).json({
      message: `Successfully transferred ${amount} points to ${toUser.name}`,
      newBalance: senderDoc.totalPoints,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};