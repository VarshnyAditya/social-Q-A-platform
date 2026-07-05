import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["earned", "deducted", "transferred_out", "transferred_in"],
    required: true,
  },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  relatedUser: { type: String, default: null }, // for transfers: the other user's id
  date: { type: Date, default: Date.now },
});

const pointsSchema = new mongoose.Schema({
  userid: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  transactions: [transactionSchema],
});

export default mongoose.model("points", pointsSchema);