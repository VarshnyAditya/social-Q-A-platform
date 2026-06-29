import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import { KeyRound, RefreshCw, Copy, Check, ArrowLeft, Eye, EyeOff, Shuffle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Stage = "form" | "password" | "success" | "limited";

// Generate letters-only password on the frontend too
const generatePassword = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [userName, setUserName] = useState("");
  const [finalPassword, setFinalPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Step 1 — validate email and move to password stage
  const handleEmailSubmit = () => {
    setEmailError("");
    if (!email.trim()) { setEmailError("Please enter your email address"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setEmailError("Please enter a valid email address"); return; }
    // Pre-fill with a generated password
    setPassword(generatePassword(12));
    setStage("password");
  };

  // Validate as user types — only letters allowed
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordError("");
    if (val && /[^a-zA-Z]/.test(val)) {
      setPasswordError("Only uppercase and lowercase letters allowed — no numbers or special characters");
    }
  };

  const handleGenerate = () => {
    setPassword(generatePassword(12));
    setPasswordError("");
  };

  // Step 2 — submit to backend
  const handleResetSubmit = async () => {
    setSubmitError("");
    if (!password.trim()) { setPasswordError("Password cannot be empty"); return; }
    if (/[^a-zA-Z]/.test(password)) { setPasswordError("Only letters allowed — no numbers or special characters"); return; }
    if (password.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/forgot-password", {
        email,
        customPassword: password,
      });
      setFinalPassword(res.data.newPassword);
      setUserName(res.data.name);
      setStage("success");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setStage("limited");
      } else {
        setSubmitError(err.response?.data?.message || "Something went wrong");
      }
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strength indicator based on length and case mix
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

        {/* Logo */}
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

        {/* STAGE 1 — Email */}
        {stage === "form" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your registered email to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                />
                {emailError && (
                  <p className="text-sm text-red-600">⚠ {emailError}</p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Note:</strong> You can only reset your password <strong>once per day</strong>. Password must contain only letters.
              </div>
              <Button onClick={handleEmailSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Continue
                </span>
              </Button>
              <div className="text-center text-sm">
                <Link href="/auth" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAGE 2 — Set Password */}
        {stage === "password" && (
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription>
                Type your own password or use the generated one. <br />
                <span className="text-orange-600 font-medium">Letters only — no numbers or special characters.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>New Password</Label>
                  {strength.label && (
                    <span className={`text-xs font-medium ${strength.color}`}>
                      {strength.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-blue-400">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 font-mono text-sm outline-none bg-transparent tracking-wider"
                    placeholder="Type your password..."
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-700"
                    title={showPassword ? "Hide" : "Show"}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-sm text-red-600">⚠ {passwordError}</p>
                )}

                {/* Rules */}
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

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 text-sm border border-dashed border-blue-300 text-blue-600 rounded-lg py-2 hover:bg-blue-50 transition"
                type="button"
              >
                <Shuffle className="w-4 h-4" />
                Generate a random password for me
              </button>

              {submitError && (
                <p className="text-sm text-red-600 text-center">⚠ {submitError}</p>
              )}

              <Button
                onClick={handleResetSubmit}
                disabled={loading || !!passwordError}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <button
                onClick={() => setStage("form")}
                className="w-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
                type="button"
              >
                <ArrowLeft className="w-3 h-3" /> Change email
              </button>
            </CardContent>
          </Card>
        )}

        {/* STAGE 3 — Success */}
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
                Hi <strong>{userName}</strong>, your password has been successfully changed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your New Password</Label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="flex-1 font-mono text-lg tracking-widest text-gray-800 select-all">
                    {showPassword ? finalPassword : "•".repeat(finalPassword.length)}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-700 p-1"
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition ${
                      copied ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    type="button"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <strong>Important:</strong> Save this password. Once you log in, go to your profile and change it to something you'll remember.
              </div>
              <Link href="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* STAGE 4 — Daily limit */}
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
                You've already reset your password today. Please try again tomorrow.
              </div>
              <Link href="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
              <div className="text-center">
                <button
                  onClick={() => { setStage("form"); setEmail(""); setEmailError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                  type="button"
                >
                  Try a different email
                </button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
