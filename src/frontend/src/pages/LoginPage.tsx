import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, HardHat, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ROLE_CREDENTIALS,
  type UserRole,
  roleToDashboardPath,
  useAuth,
} from "../AuthContext";

const roleLabels: Record<UserRole, string> = {
  siteOwner: "Site Owner",
  chiefEngineer: "Chief Engineer",
  materialsEngineer: "Materials Engineer",
  siteEngineer: "Site Engineer",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      // Navigate — the guard will pick up role and redirect
      await navigate({ to: "/dashboard/site-engineer" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function fillCredentials(role: UserRole) {
    setEmail(ROLE_CREDENTIALS[role].email);
    setPassword(ROLE_CREDENTIALS[role].password);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #071E30 0%, #0B2B45 60%, #0E3459 100%)",
      }}
    >
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F28C2A] flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            ConstructManager Pro
          </span>
        </Link>
        <Link to="/signup">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#93A4B5]/40 text-[#93A4B5] bg-transparent hover:bg-white/10 hover:text-white"
          >
            Create Account
          </Button>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-4">
          {/* Quick Access Credentials Panel */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
              style={{ color: "#F28C2A" }}
            >
              <span>View Role Credentials (Quick Access)</span>
              <span>{showCredentials ? "▲" : "▼"}</span>
            </button>
            {showCredentials && (
              <div className="px-4 pb-4 space-y-2">
                {(Object.keys(ROLE_CREDENTIALS) as UserRole[]).map((role) => (
                  <div
                    key={role}
                    className="rounded-lg p-3 flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-semibold mb-0.5">
                        {roleLabels[role]}
                      </div>
                      <div className="text-[#93A4B5] text-xs truncate">
                        {ROLE_CREDENTIALS[role].email}
                      </div>
                      <div className="text-[#93A4B5] text-xs">
                        Password:{" "}
                        <span className="text-white font-mono">
                          {ROLE_CREDENTIALS[role].password}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials(role)}
                      className="shrink-0 text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(242,140,42,0.15)",
                        color: "#F28C2A",
                        border: "1px solid rgba(242,140,42,0.3)",
                      }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card
            className="border-0 shadow-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <CardHeader className="text-center pb-6 pt-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F28C2A] flex items-center justify-center mx-auto mb-4">
                <HardHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-[#93A4B5] text-sm mt-1">
                Sign in to your ConstructManager Pro account
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#93A4B5] text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#93A4B5]/50 focus:border-[#F28C2A]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#93A4B5] text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-[#93A4B5]/50 focus:border-[#F28C2A] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93A4B5] hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm"
                    style={{
                      backgroundColor: "rgba(220,38,38,0.12)",
                      color: "#FCA5A5",
                      border: "1px solid rgba(220,38,38,0.2)",
                    }}
                  >
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full font-semibold text-white py-2.5 mt-2"
                  style={{ backgroundColor: "#F28C2A" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-center text-[#93A4B5] text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-[#F28C2A] hover:underline font-medium"
                  >
                    Create one
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
