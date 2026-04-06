import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, HardHat, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserRole, useAuth } from "../AuthContext";
import { CURRENCIES, NATIONALITIES } from "../utils/currency";

const ROLES: { value: UserRole; label: string; desc: string; color: string }[] =
  [
    {
      value: "chiefEngineer",
      label: "Chief Engineer",
      desc: "Full admin control",
      color: "#f97316",
    },
    {
      value: "siteEngineer",
      label: "Site Engineer",
      desc: "Labour & progress",
      color: "#0ea5e9",
    },
    {
      value: "materialsEngineer",
      label: "Materials Engineer",
      desc: "Inventory & stock",
      color: "#10b981",
    },
    {
      value: "siteOwner",
      label: "Site Owner",
      desc: "View reports",
      color: "#8b5cf6",
    },
  ];

export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [nationality, setNationality] = useState("🇮🇳 India");
  const [currency, setCurrency] = useState("INR (₹)");
  const [dialCode, setDialCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync dial code when nationality changes
  function handleNationalityChange(val: string) {
    setNationality(val);
    const found = NATIONALITIES.find((n) => n.label === val);
    if (found) setDialCode(found.code);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const phoneValue = phone.trim() ? `${dialCode} ${phone.trim()}` : "";
      await register(
        name.trim(),
        email.trim(),
        password,
        role as UserRole,
        nationality,
        currency,
        phoneValue,
      );
      toast.success("Account created! Welcome to ConstructManager Pro.");
      navigate({ to: "/projects" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <header className="bg-white border-b border-gray-200 text-[#1a1a1a] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              ConstructManager <span className="text-[#f97316]">Pro</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-[#1a1a1a]"
          >
            Sign In →
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#f97316]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-7 h-7 text-[#f97316]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Create your account
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Free forever. No domain restrictions. Global access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="mt-1"
                  data-ocid="signup.input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                  data-ocid="signup.input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <select
                    id="nationality"
                    value={nationality}
                    onChange={(e) => handleNationalityChange(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

              {/* Phone number row */}
              <div>
                <Label htmlFor="phone">
                  Phone Number{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <div className="grid grid-cols-[140px_1fr] gap-2 mt-1">
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                    placeholder="Phone number (optional)"
                    data-ocid="signup.input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="pr-10"
                    data-ocid="signup.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="pr-10"
                    data-ocid="signup.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

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
                              backgroundColor: `${r.color}10`,
                            }
                          : { borderColor: "#e2e8f0" }
                      }
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

              <Button
                type="submit"
                className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
                disabled={loading}
                data-ocid="signup.submit_button"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#f97316] hover:underline font-medium"
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
