import nodemailer from "nodemailer";

let transporter = null;

// Tries multiple common variable name patterns so it works regardless of
// what you named them in your .env file.
const getCredentials = () => {
  const user =
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.EMAIL ||
    process.env.MAIL_USER;

  const pass =
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_APP_PASSWORD ||
    process.env.MAIL_PASSWORD ||
    process.env.MAIL_PASS;

  return { user, pass };
};

const getTransporter = () => {
  if (!transporter) {
    const { user, pass } = getCredentials();

    console.log("Initializing mail transporter...");
    console.log("Email user present:", !!user);
    console.log("Email password present:", !!pass);

    if (!user || !pass) {
      throw new Error(
        "Email credentials missing from .env. Checked EMAIL_USER/GMAIL_USER/EMAIL/MAIL_USER and EMAIL_PASSWORD/EMAIL_PASS/EMAIL_APP_PASSWORD/GMAIL_APP_PASSWORD/MAIL_PASSWORD/MAIL_PASS — none found. Check your .env variable names."
      );
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  }
  return transporter;
};

export const sendOTPEmail = async (toEmail, otp, userName, purposeText) => {
  const { user } = getCredentials();

  const introText =
    purposeText || "We received a request to reset your password. Use the OTP below to proceed:";

  const mailOptions = {
    from: `"CodeQuest" <${user}>`,
    to: toEmail,
    subject: "Your CodeQuest account verification code",
    html: `
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
    `,
  };

  const mailer = getTransporter();
  const info = await mailer.sendMail(mailOptions);
  console.log("Email sent successfully:", info.messageId);
  return info;
};