import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, HardHat, Info, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserRole, useAuth } from "../AuthContext";
import { CURRENCIES, NATIONALITIES } from "../utils/currency";

// ─── Role definitions ───────────────────────────────────────────────────────
const ROLES: {
  value: UserRole;
  label: string;
  desc: string;
  color: string;
  bgClass: string;
}[] = [
  {
    value: "chiefEngineer",
    label: "Chief Engineer",
    desc: "Full admin control",
    color: "#f97316",
    bgClass: "bg-orange-50",
  },
  {
    value: "siteEngineer",
    label: "Site Engineer",
    desc: "Labour & progress",
    color: "#0ea5e9",
    bgClass: "bg-sky-50",
  },
  {
    value: "materialsEngineer",
    label: "Materials Engineer",
    desc: "Inventory & stock",
    color: "#10b981",
    bgClass: "bg-emerald-50",
  },
  {
    value: "siteOwner",
    label: "Site Owner",
    desc: "View reports",
    color: "#8b5cf6",
    bgClass: "bg-violet-50",
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Contact" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Profile" },
    { n: 4, label: "Password" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, idx) => (
        <div key={step.n} className="flex items-center">
          {/* Circle */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
              style={{
                background:
                  current > step.n
                    ? "#f97316"
                    : current === step.n
                      ? "#f97316"
                      : "#e2e8f0",
                color: current >= step.n ? "#fff" : "#94a3b8",
              }}
            >
              {current > step.n ? <Check className="w-4 h-4" /> : step.n}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: current >= step.n ? "#f97316" : "#94a3b8" }}
            >
              {step.label}
            </span>
          </div>
          {/* Connector */}
          {idx < steps.length - 1 && (
            <div
              className="w-10 h-0.5 mx-1 mb-4 transition-all duration-300"
              style={{
                background: current > step.n ? "#f97316" : "#e2e8f0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Wizard step ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1 — Contact ───────────────────────────────────────────────────────
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // ── Step 2 — OTP ───────────────────────────────────────────────────────────
  const [otpValue, setOtpValue] = useState("");

  // ── Step 3 — Profile ───────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("🇮🇳 India");
  const [currency, setCurrency] = useState("INR (₹)");
  const [role, setRole] = useState<UserRole | "">("");
  // Email collected in phone mode (profile step)
  const [phoneModeEmail, setPhoneModeEmail] = useState("");

  // ── Step 4 — Password ──────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Sync dial code when nationality changes ────────────────────────────────
  function handleNationalityChange(val: string) {
    setNationality(val);
    const found = NATIONALITIES.find((n) => n.label === val);
    if (found) setDialCode(found.code);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — send OTP
  // ─────────────────────────────────────────────────────────────────────────
  function handleSendCode() {
    if (contactMode === "email") {
      if (!email.trim() || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
    } else {
      if (!phone.trim()) {
        toast.error("Please enter a phone number");
        return;
      }
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtpValue("");
    toast.success("Verification code sent!");
    setStep(2);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — verify OTP
  // ─────────────────────────────────────────────────────────────────────────
  function handleVerifyCode() {
    if (otpValue.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    if (otpValue !== generatedCode) {
      toast.error("Incorrect code. Please try again.");
      setOtpValue("");
      return;
    }
    setStep(3);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 — profile continue
  // ─────────────────────────────────────────────────────────────────────────
  function handleProfileContinue() {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (
      contactMode === "phone" &&
      (!phoneModeEmail.trim() || !phoneModeEmail.includes("@"))
    ) {
      toast.error("Please enter a valid email address for your account login");
      return;
    }
    setStep(4);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4 — create account
  // ─────────────────────────────────────────────────────────────────────────
  async function handleCreateAccount() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      // Determine final email and phone values
      const finalEmail =
        contactMode === "email" ? email.trim() : phoneModeEmail.trim();
      const finalPhone =
        contactMode === "phone" ? `${dialCode} ${phone.trim()}` : "";
      await register(
        name.trim(),
        finalEmail,
        password,
        role as UserRole,
        nationality,
        currency,
        finalPhone,
      );
      toast.success("Account created! Please sign in to continue.");
      navigate({ to: "/login" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Contact destination label for OTP subtext ──────────────────────────────
  const contactLabel = contactMode === "email" ? email : `${dialCode} ${phone}`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1a1a1a]">
              ConstructManager <span className="text-[#f97316]">Pro</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-[#1a1a1a] transition-colors"
            data-ocid="signup.link"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center p-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step indicator */}
            <StepIndicator current={step} />

            <p className="text-center text-xs text-slate-400 mb-6 -mt-2">
              Step {step} of 4
            </p>

            {/* ═══════════════════════════════════════════════════════════════
                Step 1 — Contact
            ═══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div data-ocid="signup.panel">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    Verify your identity
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter your email or phone number to get started
                  </p>
                </div>

                {/* Tab toggle */}
                <div className="flex border-b border-gray-200 mb-5">
                  <button
                    type="button"
                    onClick={() => setContactMode("email")}
                    className="flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium transition-colors"
                    style={{
                      color: contactMode === "email" ? "#f97316" : "#94a3b8",
                      borderBottom:
                        contactMode === "email"
                          ? "2px solid #f97316"
                          : "2px solid transparent",
                    }}
                    data-ocid="signup.tab"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMode("phone")}
                    className="flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium transition-colors"
                    style={{
                      color: contactMode === "phone" ? "#f97316" : "#94a3b8",
                      borderBottom:
                        contactMode === "phone"
                          ? "2px solid #f97316"
                          : "2px solid transparent",
                    }}
                    data-ocid="signup.tab"
                  >
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </button>
                </div>

                {/* Email input */}
                {contactMode === "email" && (
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1"
                      data-ocid="signup.input"
                      onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    />
                  </div>
                )}

                {/* Phone input */}
                {contactMode === "phone" && (
                  <div>
                    <Label>Phone Number</Label>
                    <div className="grid grid-cols-[160px_1fr] gap-2 mt-1">
                      <select
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
                        data-ocid="signup.select"
                      >
                        {NATIONALITIES.map((n) => (
                          <option key={`${n.label}-${n.code}`} value={n.code}>
                            {n.label.split(" ")[0]} {n.code}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        data-ocid="signup.input"
                        onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      You'll also set an email address on the next step for
                      account login.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full mt-5 bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleSendCode}
                  data-ocid="signup.primary_button"
                >
                  Send Verification Code
                </Button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                Step 2 — OTP Verification
            ═══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div data-ocid="signup.panel">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    Enter verification code
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-[#0f172a]">
                      {contactLabel}
                    </span>
                  </p>
                </div>

                {/* Dev/test banner */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#f97316] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-800 mb-0.5">
                      Development / Test Mode
                    </p>
                    <p className="text-xs text-orange-700">
                      Your verification code:{" "}
                      <span className="font-bold tracking-widest text-[#f97316]">
                        {generatedCode}
                      </span>
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      Real email/SMS is not enabled. Copy the code above.
                    </p>
                  </div>
                </div>

                {/* OTP input */}
                <div className="flex justify-center mb-6">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    data-ocid="signup.input"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-11 h-12 text-lg border-2 focus:border-[#f97316]"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleVerifyCode}
                  data-ocid="signup.primary_button"
                >
                  Verify Code
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-[#f97316] transition-colors"
                  data-ocid="signup.secondary_button"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                Step 3 — Profile
            ═══════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div data-ocid="signup.panel">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    Complete your profile
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Tell us a bit about yourself
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full name */}
                  <div>
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="mt-1"
                      data-ocid="signup.input"
                    />
                  </div>

                  {/* Email (phone mode only) */}
                  {contactMode === "phone" && (
                    <div>
                      <Label htmlFor="phoneModeEmail">
                        Email Address{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (used for account login)
                        </span>
                      </Label>
                      <Input
                        id="phoneModeEmail"
                        type="email"
                        value={phoneModeEmail}
                        onChange={(e) => setPhoneModeEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1"
                        data-ocid="signup.input"
                      />
                    </div>
                  )}

                  {/* Nationality & Currency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <select
                        id="nationality"
                        value={nationality}
                        onChange={(e) =>
                          handleNationalityChange(e.target.value)
                        }
                        className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
                        data-ocid="signup.select"
                      >
                        {NATIONALITIES.map((n) => (
                          <option key={n.label} value={n.label}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
                        data-ocid="signup.select"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div>
                    <Label>Select Your Role</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className="p-3 rounded-xl border-2 text-left transition-all"
                          style={
                            role === r.value
                              ? {
                                  borderColor: r.color,
                                  backgroundColor: `${r.color}15`,
                                }
                              : { borderColor: "#e2e8f0" }
                          }
                          data-ocid="signup.toggle"
                        >
                          <p
                            className="text-sm font-semibold"
                            style={{
                              color: role === r.value ? r.color : "#0f172a",
                            }}
                          >
                            {r.label}
                          </p>
                          <p className="text-xs text-slate-400">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-5 bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleProfileContinue}
                  data-ocid="signup.primary_button"
                >
                  Continue →
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-[#f97316] transition-colors"
                  data-ocid="signup.secondary_button"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                Step 4 — Set Password
            ═══════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <div data-ocid="signup.panel">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    Set your password
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Choose a secure password to complete your account setup
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="pr-10"
                        data-ocid="signup.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Strength hint */}
                    {password.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all"
                            style={{
                              background:
                                password.length >= i * 3
                                  ? i <= 1
                                    ? "#ef4444"
                                    : i === 2
                                      ? "#f59e0b"
                                      : i === 3
                                        ? "#3b82f6"
                                        : "#10b981"
                                  : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat your password"
                        className="pr-10"
                        data-ocid="signup.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirm.length > 0 && (
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: password === confirm ? "#10b981" : "#ef4444",
                        }}
                      >
                        {password === confirm
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleCreateAccount}
                  disabled={loading}
                  data-ocid="signup.submit_button"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-[#f97316] transition-colors"
                  data-ocid="signup.secondary_button"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* ── Footer ── */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#f97316] hover:underline font-medium"
                data-ocid="signup.link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
