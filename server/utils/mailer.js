// Email sending via SMTP2GO's transactional email API (https://www.smtp2go.com)
// instead of raw SMTP — most production hosts (Render, Vercel) block or
// throttle outbound SMTP ports, so this goes over plain HTTPS instead.
const SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send";

export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const fromEmail = process.env.SMTP2GO_SENDER_EMAIL;
  const fromName = process.env.SMTP2GO_SENDER_NAME || "CodeQuest";

  console.log("MAILER ENV:", {
    apiKey: !!apiKey,
    fromEmail,
    fromName,
  });

  if (!apiKey) {
    throw new Error("SMTP2GO_API_KEY missing");
  }

  if (!fromEmail) {
    throw new Error("SMTP2GO_SENDER_EMAIL missing");
  }

  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch(SMTP2GO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-Smtp2go-Api-Key": apiKey,
    },
    body: JSON.stringify({
      sender: `${fromName} <${fromEmail}>`,
      to: recipients,
      subject,
      html_body: html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  // SMTP2GO returns 200 with data.data.failed > 0 for per-recipient failures
  // (e.g. unverified sender, invalid address) rather than always using HTTP
  // error codes — so check both.
  const failed = data?.data?.failed ?? 0;
  if (!response.ok || failed > 0) {
    console.error("SMTP2GO API error:", data);
    const reason = data?.data?.failures?.[0] || data?.data?.error || "Failed to send email via SMTP2GO";
    throw new Error(reason);
  }

  console.log("Email sent successfully via SMTP2GO:", data?.data?.email_id);
  return data;
};

// Used by: Chrome-login OTP, forgot-password OTP, and any other OTP flow —
// same call signature as before this migration, so none of the callers in
// auth.js or language.js need to change.
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