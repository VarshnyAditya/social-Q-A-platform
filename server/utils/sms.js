// No real SMS gateway is configured in this project (no Twilio/MSG91 credentials).
// This util keeps the same shape sendOTPEmail() has in mailer.js, so swapping in a
// real provider later is just filling in the body of sendOTPSms() — nothing else
// in the codebase needs to change.

export const sendOTPSms = async (toPhone, otp, userName) => {
  // Placeholder "delivery": log it the way a real SMS gateway call would resolve.
  console.log("=== SMS OTP (placeholder — no SMS gateway configured) ===");
  console.log(`To: ${toPhone}`);
  console.log(`Message: Hi ${userName}, your CodeQuest verification code is ${otp}. Valid for 10 minutes.`);
  console.log("===========================================================");

  // Mimic what a real provider's SDK call would return.
  return { status: "queued", to: toPhone, provider: "placeholder" };
};

// Masks a phone number for display, e.g. "+919876543210" -> "****3210"
export const maskPhone = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
};

// Masks an email for display, e.g. "john.doe@gmail.com" -> "j***@gmail.com"
export const maskEmail = (email = "") => {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
};
