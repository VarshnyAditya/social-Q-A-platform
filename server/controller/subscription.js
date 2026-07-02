import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Subscription from "../models/subscription.js";
import User from "../models/auth.js";

// ---- Plan definitions ----
// Prices are in paise (Razorpay expects the smallest currency unit for INR)
export const PLANS = {
  free: { label: "Free", price: 0, dailyLimit: 1 },
  bronze: { label: "Bronze", price: 100 * 100, dailyLimit: 5 },
  silver: { label: "Silver", price: 300 * 100, dailyLimit: 10 },
  gold: { label: "Gold", price: 1000 * 100, dailyLimit: Infinity },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---- IST time-gate helper ----
// Payments only allowed between 10:00 AM and 11:00 AM IST (regardless of server's own timezone)
const isWithinPaymentWindow = () => {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istNow = new Date(istString);
  const hours = istNow.getHours();
  const minutes = istNow.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const windowStart = 10 * 60; // 10:00 AM
  const windowEnd = 11 * 60; // 11:00 PM
  return totalMinutes >= windowStart && totalMinutes < windowEnd;
};

// ---- Email transporter ----
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendInvoiceEmail = async ({ to, name, plan, amount, paymentId, date }) => {
  const amountInRupees = (amount / 100).toFixed(2);
  const mailOptions = {
    from: `"StackClone Billing" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your ${PLANS[plan].label} Plan Invoice — StackClone`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 24px;">
        <h2 style="color: #ef8236;">Payment Successful 🎉</h2>
        <p>Hi ${name},</p>
        <p>Thank you for subscribing to the <strong>${PLANS[plan].label} Plan</strong>. Here are your invoice details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Plan</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${PLANS[plan].label}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Amount Paid</td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${amountInRupees}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Payment ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentId}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>
          <tr><td style="padding: 8px;">Daily Question Limit</td><td style="padding: 8px;">${
            PLANS[plan].dailyLimit === Infinity ? "Unlimited" : PLANS[plan].dailyLimit
          }</td></tr>
        </table>
        <p style="margin-top: 24px; color: #777; font-size: 13px;">This is an automated email, please do not reply.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Helper: JSON can't represent Infinity (it becomes null), so swap it for the string "Infinity"
// on the way out and the frontend checks for that string explicitly.
const serializePlan = (planKey) => {
  const plan = PLANS[planKey];
  return {
    ...plan,
    dailyLimit: plan.dailyLimit === Infinity ? "Infinity" : plan.dailyLimit,
  };
};

// GET /subscription/plans
export const getPlans = (req, res) => {
  const serialized = Object.fromEntries(
    Object.keys(PLANS).map((key) => [key, serializePlan(key)])
  );
  res.status(200).json({ plans: serialized });
};

// GET /subscription/mystatus
export const getMyStatus = async (req, res) => {
  try {
    const userid = req.userid;
    const sub = await Subscription.findOne({ userid, status: "active" }).sort({ startDate: -1 });
    if (!sub || (sub.expiryDate && new Date(sub.expiryDate) < new Date())) {
      return res.status(200).json({ plan: "free", ...serializePlan("free") });
    }
    res.status(200).json({
      plan: sub.plan,
      ...serializePlan(sub.plan),
      expiryDate: sub.expiryDate,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// POST /subscription/create-order   { plan: "bronze" | "silver" | "gold" }
export const createOrder = async (req, res) => {
  try {
    console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "present" : "missing");
    // ---- TIME GATE ----
    if (!isWithinPaymentWindow()) {
      return res.status(403).json({
        message: "Payments are only allowed between 10:00 AM and 11:00 AM IST. Please try again during that window.",
      });
    }

    const { plan } = req.body;
    if (!plan || !PLANS[plan] || plan === "free") {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const amount = PLANS[plan].price;
    const options = {
      amount, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userid: req.userid, plan },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch (error) {
    console.log("Razorpay error full:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// POST /subscription/verify-payment
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
export const verifyPayment = async (req, res) => {
  try {
    // ---- TIME GATE (re-checked on verify so the window can't be bypassed by waiting) ----
    if (!isWithinPaymentWindow()) {
      return res.status(403).json({
        message: "Payment window has closed (10:00–11:00 AM IST only). Payment not completed.",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // ---- Signature verification (security: confirms payment really came from Razorpay) ----
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed — signature mismatch" });
    }

    const userid = req.userid;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amount = PLANS[plan].price;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30-day subscription

    const subscription = await Subscription.create({
      userid,
      plan,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount,
      expiryDate,
      status: "active",
    });

    // ---- Send invoice email (failure here should not block the subscription itself) ----
    try {
      await sendInvoiceEmail({
        to: user.email,
        name: user.name,
        plan,
        amount,
        paymentId: razorpay_payment_id,
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    } catch (emailErr) {
      console.error("Invoice email failed to send:", emailErr.message);
    }

    res.status(200).json({
      message: "Payment verified and subscription activated",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};