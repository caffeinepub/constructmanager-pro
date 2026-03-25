import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Check,
  Eye,
  EyeOff,
  HardHat,
  Loader2,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type UserRole, roleToDashboardPath, useAuth } from "../AuthContext";

const roleOptions: {
  value: UserRole;
  label: string;
  slug: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "siteEngineer",
    label: "Site Engineer",
    slug: "site-engineer",
    icon: Users,
    description: "Monitor tasks, log daily progress, manage labour",
  },
  {
    value: "chiefEngineer",
    label: "Chief Engineer",
    slug: "chief-engineer",
    icon: Shield,
    description: "Oversee projects, approve materials and budgets",
  },
  {
    value: "materialsEngineer",
    label: "Materials Engineer",
    slug: "materials-engineer",
    icon: Package,
    description: "Manage inventory, stock updates and reorder alerts",
  },
  {
    value: "siteOwner",
    label: "Site Owner",
    slug: "site-owner",
    icon: BarChart2,
    description: "Full platform access with financial overview",
  },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("siteEngineer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleSlug = params.get("role");
    if (roleSlug) {
      const match = roleOptions.find((r) => r.slug === roleSlug);
      if (match) setSelectedRole(match.value);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, selectedRole);
      toast.success("Account created! Welcome to ConstructManager Pro.");
      await navigate({ to: roleToDashboardPath(selectedRole) });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
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
        <Link to="/login">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#93A4B5]/40 text-[#93A4B5] bg-transparent hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Button>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Card
            className="border-0 shadow-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <CardHeader className="text-center pb-4 pt-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F28C2A] flex items-center justify-center mx-auto mb-4">
                <HardHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Create Your Account
              </h1>
              <p className="text-[#93A4B5] text-sm mt-1">
                Join ConstructManager Pro — choose your role to get started
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[#93A4B5] text-sm">
                    Select Your Role
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className="relative text-left rounded-xl p-3 transition-all border"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: "rgba(242,140,42,0.15)",
                                  borderColor: "#F28C2A",
                                }
                              : {
                                  backgroundColor: "rgba(255,255,255,0.04)",
                                  borderColor: "rgba(255,255,255,0.08)",
                                }
                          }
                        >
                          {isSelected && (
                            <Check
                              className="absolute top-2 right-2 w-4 h-4"
                              style={{ color: "#F28C2A" }}
                            />
                          )}
                          <Icon
                            className="w-5 h-5 mb-2"
                            style={{
                              color: isSelected ? "#F28C2A" : "#93A4B5",
                            }}
                          />
                          <div
                            className="font-semibold text-sm"
                            style={{ color: isSelected ? "white" : "#93A4B5" }}
                          >
                            {role.label}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "#6B7280" }}
                          >
                            {role.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[#93A4B5] text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-[#93A4B5]/50 focus:border-[#F28C2A]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-email"
                      className="text-[#93A4B5] text-sm"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="bg-white/5 border-white/10 text-white placeholder:text-[#93A4B5]/50 focus:border-[#F28C2A]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-password"
                      className="text-[#93A4B5] text-sm"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirm-password"
                      className="text-[#93A4B5] text-sm"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-[#93A4B5]/50 focus:border-[#F28C2A]"
                    />
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
                  className="w-full rounded-full font-semibold text-white py-2.5"
                  style={{ backgroundColor: "#F28C2A" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-center text-[#93A4B5] text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#F28C2A] hover:underline font-medium"
                  >
                    Sign in
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
