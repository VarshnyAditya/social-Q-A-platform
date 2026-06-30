import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
  userid: { type: String, required: true },
  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  amount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "expired", "pending"],
    default: "pending",
  },
});

export default mongoose.model("subscription", subscriptionSchema);