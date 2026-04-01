import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, HardHat, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { roleToDashboardPath, useAuth } from "../AuthContext";

const DEMO_CREDS = [
  {
    role: "Chief Engineer",
    email: "ce@demo.com",
    pw: "ChiefEng@123",
    color: "#f97316",
  },
  {
    role: "Site Engineer",
    email: "se@demo.com",
    pw: "SiteEng@123",
    color: "#0ea5e9",
  },
  {
    role: "Materials Engineer",
    email: "me@demo.com",
    pw: "MatEng@123",
    color: "#10b981",
  },
  {
    role: "Site Owner",
    email: "so@demo.com",
    pw: "SiteOwner@123",
    color: "#8b5cf6",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Logged in successfully!");
      navigate({ to: "/projects" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillCred(email: string, pw: string) {
    setEmail(email);
    setPassword(pw);
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <header className="bg-[#0f172a] text-white px-6 py-4">
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
            to="/signup"
            className="text-sm text-slate-400 hover:text-white"
          >
            Sign Up →
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#f97316]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-7 h-7 text-[#f97316]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Welcome back
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  data-ocid="login.input"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    className="pr-10"
                    data-ocid="login.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                No account?{" "}
                <Link
                  to="/signup"
                  className="text-[#f97316] hover:underline font-medium"
                >
                  Create one free
                </Link>
              </p>
            </div>

            <div className="mt-6 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowCreds(!showCreds)}
                className="w-full text-sm text-slate-500 hover:text-[#f97316] flex items-center justify-center gap-1"
              >
                {showCreds ? "Hide" : "View"} Demo Credentials
              </button>
              {showCreds && (
                <div className="mt-3 space-y-2">
                  {DEMO_CREDS.map((c) => (
                    <div
                      key={c.email}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: c.color }}
                        >
                          {c.role}
                        </p>
                        <p className="text-xs text-slate-500">
                          {c.email} / <span className="font-mono">{c.pw}</span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => fillCred(c.email, c.pw)}
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
