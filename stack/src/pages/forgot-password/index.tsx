import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import { KeyRound, RefreshCw, Copy, Check, ArrowLeft, Eye, EyeOff, Shuffle, Mail, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

type Stage = "identifier" | "otp" | "password" | "success" | "limited";

const generatePassword = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function ForgotPassword() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("identifier");

  const [userId, setUserId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [finalUserName, setFinalUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // STEP 1 — Request OTP using email or phone
  const handleRequestOTP = async () => {
    setIdentifierError("");
    if (!identifier.trim()) {
      setIdentifierError(`Please enter your ${method === "email" ? "email address" : "phone number"}`);
      return;
    }
    if (method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setIdentifierError("Please enter a valid email address");
        return;
      }
    } else {
      if (!/^\d{10}$/.test(identifier)) {
        setIdentifierError("Please enter a valid 10-digit phone number");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/send-otp", { identifier });
      setUserId(res.data.userId);
      setMaskedEmail(res.data.maskedEmail);
      setStage("otp");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setStage("limited");
      } else {
        setIdentifierError(err.response?.data?.message || "Something went wrong");
      }
    }
    setLoading(false);
  };

  // OTP input handling — auto-advance between boxes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/user/verify-otp", { userId, otp });
      setPassword(generatePassword(12));
      setStage("password");
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    await handleRequestOTP();
  };

  // Password stage
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordError("");
    if (val && /[^a-zA-Z]/.test(val)) {
      setPasswordError("Only uppercase and lowercase letters allowed");
    }
  };

  const handleGenerate = () => {
    setPassword(generatePassword(12));
    setPasswordError("");
  };

  // STEP 3 — Set new password
  const handleSetPassword = async () => {
    setSubmitError("");
    if (!password.trim()) { setPasswordError("Password cannot be empty"); return; }
    if (/[^a-zA-Z]/.test(password)) { setPasswordError("Only letters allowed"); return; }
    if (password.length < 6) { setPasswordError("Must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/reset-password-otp", {
        userId,
        newPassword: password,
      });
      setFinalUserName(res.data.name);
      setStage("success");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = (pw: string) => {
    if (!pw || pw.length < 6) return { label: "", color: "" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    if (pw.length >= 12 && hasUpper && hasLower) return { label: "Strong", color: "text-green-600" };
    if (pw.length >= 8) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Weak", color: "text-red-500" };
  };
  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-800">
              Code<span className="font-normal">Quest</span>
            </span>
          </Link>
        </div>

        {/* STAGE 1 — Email or Phone */}
        {stage === "identifier" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                We'll send a One-Time Password (OTP) to your registered email to verify it's you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Method toggle */}
              <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => { setMethod("email"); setIdentifier(""); setIdentifierError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition ${
                    method === "email" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod("phone"); setIdentifier(""); setIdentifierError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition ${
                    method === "phone" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {method === "email" ? "Email Address" : "Phone Number"}
                </Label>
                {method === "email" ? (
                  <Input
                    id="identifier"
                    type="email"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setIdentifierError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRequestOTP(); }}
                  />
                ) : (
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <Input
                      id="identifier"
                      type="tel"
                      placeholder="10-digit number"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 10)); setIdentifierError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRequestOTP(); }}
                      className="rounded-l-none"
                    />
                  </div>
                )}
                {identifierError && <p className="text-sm text-red-600">⚠ {identifierError}</p>}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Note:</strong> The OTP is sent to your <strong>registered email</strong> regardless of method, and can only be requested <strong>once per day</strong>.
              </div>

              <Button onClick={handleRequestOTP} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...</span>
                ) : (
                  <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Send OTP</span>
                )}
              </Button>

              <div className="text-center text-sm">
                <Link href="/auth" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAGE 2 — Verify OTP */}
        {stage === "otp" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Enter OTP</CardTitle>
              <CardDescription>
                We sent a 6-digit code to <strong>{maskedEmail}</strong>. It expires in 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ))}
              </div>
              {otpError && <p className="text-sm text-red-600 text-center">⚠ {otpError}</p>}

              <Button onClick={handleVerifyOTP} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</span>
                ) : "Verify OTP"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Didn't receive it?{" "}
                <button onClick={handleResendOTP} className="text-blue-600 hover:underline" type="button">
                  Resend OTP
                </button>
              </div>

              <button
                onClick={() => { setStage("identifier"); setOtpDigits(["", "", "", "", "", ""]); }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
                type="button"
              >
                <ArrowLeft className="w-3 h-3" /> Change email/phone
              </button>
            </CardContent>
          </Card>
        )}

        {/* STAGE 3 — Set Password */}
        {stage === "password" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription>
                OTP verified! Type your own password or use the generated one. <br />
                <span className="text-orange-600 font-medium">Letters only — no numbers or special characters.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>New Password</Label>
                  {strength.label && <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>}
                </div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-blue-400">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 font-mono text-sm outline-none bg-transparent tracking-wider"
                    placeholder="Type your password..."
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700" type="button">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-red-600">⚠ {passwordError}</p>}

                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className={`flex items-center gap-1 ${password.length >= 6 ? "text-green-600" : "text-gray-400"}`}>
                    <span>{password.length >= 6 ? "✓" : "○"}</span> At least 6 characters
                  </span>
                  <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <span>{/[A-Z]/.test(password) ? "✓" : "○"}</span> Has uppercase
                  </span>
                  <span className={`flex items-center gap-1 ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <span>{/[a-z]/.test(password) ? "✓" : "○"}</span> Has lowercase
                  </span>
                  <span className={`flex items-center gap-1 ${password && !/[^a-zA-Z]/.test(password) ? "text-green-600" : "text-red-500"}`}>
                    <span>{password && !/[^a-zA-Z]/.test(password) ? "✓" : "✗"}</span> Letters only
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 text-sm border border-dashed border-blue-300 text-blue-600 rounded-lg py-2 hover:bg-blue-50 transition"
                type="button"
              >
                <Shuffle className="w-4 h-4" /> Generate a random password for me
              </button>

              {submitError && <p className="text-sm text-red-600 text-center">⚠ {submitError}</p>}

              <Button onClick={handleSetPassword} disabled={loading || !!passwordError} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</span>
                ) : "Set Password"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STAGE 4 — Success */}
        {stage === "success" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Password Updated!</CardTitle>
              <CardDescription>
                Hi <strong>{finalUserName}</strong>, your password has been successfully changed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your New Password</Label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="flex-1 font-mono text-lg tracking-widest text-gray-800 select-all">
                    {showPassword ? password : "•".repeat(password.length)}
                  </span>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700 p-1" type="button">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition ${copied ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    type="button"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
              <Link href="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* STAGE 5 — Daily limit */}
        {stage === "limited" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
              <CardTitle className="text-2xl">Limit Reached</CardTitle>
              <CardDescription>You can use this option only one time per day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800 text-center">
                You've already requested an OTP today. Please try again tomorrow.
              </div>
              <Link href="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
