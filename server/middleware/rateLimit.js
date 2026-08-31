import rateLimit from "express-rate-limit";

// Baseline — applied app-wide. Generous enough that a real user browsing
// normally never notices it; it exists to blunt scripted abuse against any
// endpoint that doesn't have its own tighter limiter below.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes." },
});

// Login — throttles password brute-forcing against a known email.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in a few minutes." },
});

// OTP send — stops someone from spamming a target's inbox with OTP emails,
// or burning through the email provider's send quota.
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait a few minutes and try again." },
});

// OTP verify — the critical one. A 6-digit code with no throttling is
// brute-forceable well within its 10-minute expiry window. Keyed by the
// userId being targeted (falling back to IP if it's ever missing) so an
// attacker can't dodge the limit by spreading guesses across many IPs
// against the same account.
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.userId || req.ip,
  message: { message: "Too many incorrect attempts. Please request a new OTP." },
});

// Same idea for the language-change OTP flow — but that route is already
// behind `auth`, so key by the authenticated user instead of a body field.
export const authedOtpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userid || req.ip,
  message: { message: "Too many incorrect attempts. Please request a new OTP." },
});

// Translation — unauthenticated by design, so it needs its own ceiling
// independent of login state.
export const translateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many translation requests. Please slow down." },
});