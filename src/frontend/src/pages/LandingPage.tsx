import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle,
  Eye,
  EyeOff,
  Github,
  HardHat,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserRole, useAuth } from "../AuthContext";

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

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: "chiefEngineer", label: "Chief Engineer", color: "#f97316" },
  { value: "siteEngineer", label: "Site Engineer", color: "#0ea5e9" },
  { value: "materialsEngineer", label: "Materials Engineer", color: "#10b981" },
  { value: "siteOwner", label: "Site Owner", color: "#8b5cf6" },
];

const FEATURES = [
  {
    icon: BarChart2,
    title: "Real-time Progress",
    desc: "Visual dashboards with live updates for project completion %",
    color: "#f97316",
  },
  {
    icon: Users,
    title: "GPS Attendance",
    desc: "Daily clock-in/out with GPS stamp. Auto-calculate wages.",
    color: "#0ea5e9",
  },
  {
    icon: Bell,
    title: "Reorder Alerts",
    desc: "Automatic low-stock notifications to Material Engineers.",
    color: "#10b981",
  },
  {
    icon: Package,
    title: "Material Inventory",
    desc: "Alphabetically sorted inventory with GRN and issue tracking.",
    color: "#8b5cf6",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "4 distinct roles with enforced permissions per action.",
    color: "#f97316",
  },
  {
    icon: BookOpen,
    title: "Audit Log",
    desc: "Every action logged with timestamp and user for accountability.",
    color: "#0ea5e9",
  },
];

const OWNERS = [
  {
    name: "Mohamed Asif M",
    role: "Full Stack Lead",
    img: "/assets/uploads/mohamed_asif_m-019d2137-fc1c-725f-850e-007b024c42ab-2.png",
    email: "mohamedasif.ce23@krct.ac.in",
  },
  {
    name: "Kumaran Bala",
    role: "Backend Engineer",
    img: "/assets/uploads/kumaran_bala-019d2137-fc07-76ee-9225-b8a357eb3e63-1.png",
    email: "kumaranbala.ce23@krct.ac.in",
  },
  {
    name: "Aswin M",
    role: "Frontend Developer",
    img: "/assets/uploads/aswin_m-019d2137-fd4c-77ab-b14a-5efea6ad48a2-3.png",
    email: "aswin.ce23@krct.ac.in",
  },
  {
    name: "Raksha Manikandan M",
    role: "UI/UX Designer",
    img: "/assets/uploads/raksha_manikandan_m-019d2138-02c2-7368-a7b5-e0fae8e9a060-4.png",
    email: "rakshamanikandan.ce23@krct.ac.in",
  },
];

function AuthSection() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regRole, setRegRole] = useState<UserRole | "">("");
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginEmail.trim(), loginPw);
      toast.success("Logged in!");
      navigate({ to: "/projects" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regRole) {
      toast.error("Select a role");
      return;
    }
    if (regPw !== regConfirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (regPw.length < 6) {
      toast.error("Password too short (min 6)");
      return;
    }
    setRegLoading(true);
    try {
      await register(
        regName.trim(),
        regEmail.trim(),
        regPw,
        regRole as UserRole,
      );
      toast.success("Account created!");
      navigate({ to: "/projects" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  }

  function fillCredential(email: string, pw: string) {
    setLoginEmail(email);
    setLoginPw(pw);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
      <Tabs defaultValue="login">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="login" className="flex-1">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showLoginPw ? "text" : "password"}
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="Password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showLoginPw ? (
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
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-3 border-t pt-3">
            <button
              type="button"
              onClick={() => setShowCreds(!showCreds)}
              className="text-xs text-slate-400 hover:text-[#f97316] w-full text-center"
            >
              {showCreds ? "Hide" : "View"} Demo Credentials
            </button>
            {showCreds && (
              <div className="mt-2 space-y-1.5">
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
                      className="h-6 text-xs px-2"
                      onClick={() => fillCredential(c.email, c.pw)}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showRegPw ? "text" : "password"}
                  value={regPw}
                  onChange={(e) => setRegPw(e.target.value)}
                  placeholder="Min. 6 chars"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPw(!showRegPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showRegPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showRegConfirm ? "text" : "password"}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirm(!showRegConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showRegConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRegRole(r.value)}
                    className="px-2 py-2 rounded-lg border text-xs font-medium transition-all"
                    style={
                      regRole === r.value
                        ? {
                            borderColor: r.color,
                            backgroundColor: `${r.color}10`,
                            color: r.color,
                          }
                        : { borderColor: "#e2e8f0", color: "#0f172a" }
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
              disabled={regLoading}
            >
              {regLoading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 text-[#1a1a1a] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              ConstructManager <span className="text-[#f97316]">Pro</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 hover:bg-[#f97316]/30 cursor-pointer">
                <Github className="w-3 h-3 mr-1" /> Open Source
              </Badge>
            </a>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/user-manual">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-[#1a1a1a] hidden sm:flex"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Manual
              </Button>
            </Link>
            <Link to="/demo">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:border-[#f97316] hover:text-[#f97316]"
              >
                Try Demo
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
              >
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#f4f5f7] py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 mb-4">
              Open Source • Free Forever
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Construction Site
              <br />
              <span className="text-[#f97316]">Management</span> Made Easy
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Integrated Material & Labour Management for Construction Sites.
              Role-based, real-time, and globally accessible.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/demo">
                <Button className="bg-[#f97316] hover:bg-[#ea6c10] text-white px-6">
                  Try Demo
                </Button>
              </Link>
              <Link to="/user-manual">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:border-[#1a1a1a]"
                >
                  View Manual
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "Role-Based Access",
                "Real-time Updates",
                "Alphabetical Inventory",
                "GPS Attendance",
              ].map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 text-xs text-gray-500"
                >
                  <CheckCircle className="w-3 h-3 text-[#f97316]" />
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AuthSection />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-2">
              Everything a construction team needs
            </h2>
            <p className="text-slate-500">
              Manage labour, materials, and progress from a single platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${f.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="font-semibold text-[#0f172a] mb-1">
                      {f.title}
                    </h3>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 mb-3">
              Demo Preview
            </Badge>
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">
              See it in action
            </h2>
            <p className="text-gray-500">
              Real data. Real workflows. No login required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Material Stock Card */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-[#10b981]" />
                <span className="text-[#1a1a1a] text-sm font-semibold">
                  Material Stock
                </span>
                <Badge className="ml-auto bg-orange-500/20 text-orange-400 text-xs">
                  2 Alerts
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: "Cement (OPC 53)",
                    stock: 200,
                    unit: "bags",
                    ok: true,
                  },
                  { name: "Sand (Fine)", stock: 4, unit: "tons", ok: false },
                  { name: "Steel Bars", stock: 2000, unit: "kg", ok: true },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-600">{m.name}</span>
                    <Badge
                      className={`text-xs ${m.ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {m.stock} {m.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Labour Attendance Card */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#0ea5e9]" />
                <span className="text-[#1a1a1a] text-sm font-semibold">
                  Attendance Today
                </span>
                <Badge className="ml-auto bg-blue-500/20 text-blue-400 text-xs">
                  4/5 Present
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Rajesh Kumar", skill: "Mason", present: true },
                  { name: "Sudhir Singh", skill: "Carpenter", present: true },
                  { name: "Mohan Lal", skill: "Electrician", present: true },
                  { name: "Amar Nath", skill: "Plumber", present: false },
                ].map((w) => (
                  <div
                    key={w.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-600">
                      {w.name} — {w.skill}
                    </span>
                    <Badge
                      className={`text-xs ${w.present ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}
                    >
                      {w.present ? "P" : "A"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Notifications */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-[#f97316]" />
                <span className="text-[#1a1a1a] text-sm font-semibold">
                  Notifications
                </span>
                <Badge className="ml-auto bg-red-500/20 text-red-400 text-xs">
                  3 New
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  { msg: "Sand (Fine) below reorder level", type: "error" },
                  { msg: "Payroll Week 2 pending approval", type: "warn" },
                  { msg: "Project Alpha: 45% complete", type: "info" },
                ].map((n) => (
                  <div
                    key={n.msg}
                    className={`flex items-start gap-2 text-xs rounded-lg p-2 ${n.type === "error" ? "bg-red-500/10 text-red-300" : n.type === "warn" ? "bg-yellow-500/10 text-yellow-300" : "bg-blue-500/10 text-blue-300"}`}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                      style={{
                        backgroundColor:
                          n.type === "error"
                            ? "#ef4444"
                            : n.type === "warn"
                              ? "#f59e0b"
                              : "#3b82f6",
                      }}
                    />
                    {n.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link to="/demo">
              <Button className="bg-[#f97316] hover:bg-[#ea6c10] text-white px-8">
                Explore Full Demo →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-2">
              Meet the Team
            </h2>
            <p className="text-slate-500">
              Built with passion by engineering students.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {OWNERS.map((o) => (
              <Card
                key={o.email}
                className="text-center hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-3 overflow-hidden">
                    <img
                      src={o.img}
                      alt={o.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-[#0f172a] text-sm">
                    {o.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">{o.role}</p>
                  <a
                    href={`mailto:${o.email}`}
                    className="text-xs text-[#f97316] hover:underline break-all"
                  >
                    {o.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">
              Role-Based Access
            </h2>
            <p className="text-gray-500">
              Each role sees only what they need. No clutter, no confusion.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "Chief Engineer",
                color: "#f97316",
                perms: [
                  "Create projects",
                  "Manage team",
                  "Approve payroll",
                  "Full audit log",
                ],
              },
              {
                role: "Site Engineer",
                color: "#0ea5e9",
                perms: [
                  "Add workers",
                  "Mark attendance",
                  "Update progress",
                  "Submit payroll",
                ],
              },
              {
                role: "Materials Engineer",
                color: "#10b981",
                perms: [
                  "Add materials",
                  "Record GRN",
                  "Issue materials",
                  "Monitor stock",
                ],
              },
              {
                role: "Site Owner",
                color: "#8b5cf6",
                perms: [
                  "View dashboards",
                  "Review budgets",
                  "Financial reports",
                  "Progress overview",
                ],
              },
            ].map((r) => (
              <div
                key={r.role}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${r.color}20` }}
                >
                  <Shield className="w-4 h-4" style={{ color: r.color }} />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] text-sm mb-2">
                  {r.role}
                </h3>
                <ul className="space-y-1">
                  {r.perms.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-1.5 text-xs text-gray-500"
                    >
                      <CheckCircle
                        className="w-3 h-3"
                        style={{ color: r.color }}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center">
                <HardHat className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">ConstructManager Pro</span>
              <Badge className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 text-xs">
                Open Source
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
              {OWNERS.map((o) => (
                <a
                  key={o.email}
                  href={`mailto:${o.email}`}
                  className="hover:text-[#f97316]"
                >
                  {o.email}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ConstructManager Pro &bull; Built
            with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f97316] hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
