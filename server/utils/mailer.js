// Email sending via Brevo's transactional email API (https://www.brevo.com)
// instead of raw SMTP — most production hosts block outbound SMTP ports
const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";
export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_SENDER_EMAIL;
  const fromName = process.env.MAILERSEND_SENDER_NAME || "CodeQuest";

  console.log("MAILER ENV:", {
    apiKey: !!apiKey,
    fromEmail,
    fromName
  });

  if (!apiKey) {
    throw new Error("MAILERSEND_API_KEY missing");
  }

  if (!fromEmail) {
    throw new Error("MAILERSEND_SENDER_EMAIL missing");
  }

  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch(MAILERSEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName, },
      to: recipients.map((email) => ({ email })),
      subject,
      html: html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("MailerSend API error:", data);
    throw new Error(data.message || "Failed to send email via MailerSend");
  }

  console.log("Email sent successfully via Brevo:", data.messageId);
  return data;
};

// Used by: Chrome-login OTP, forgot-password OTP, and any other OTP flow —
// same call signature as before this migration, so none of the callers in
// auth.js (or language.js, if that's where the French path lives) need to change.
export const sendOTPEmail = async (toEmail, otp, userName, purposeText) => {
  const introText =
    purposeText || "We received a request to reset your password. Use the OTP below to proceed:";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #f97316; margin: 0;">CodeQuest</h2>
      </div>
      <h3 style="color: #111827;">Hi ${userName},</h3>
      <p style="color: #6b7280;">${introText}</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1d4ed8;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <p style="color: #9ca3af; font-size: 12px;">If you did not request this, ignore this email. No changes will be made to your account.</p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject: "Your CodeQuest account verification code", html });
};