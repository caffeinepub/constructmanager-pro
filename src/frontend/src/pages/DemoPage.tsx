import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  HardHat,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ensureDemoSeeded } from "../canister";

type DemoRole = "chief" | "site" | "materials" | "owner";

const ROLES: {
  key: DemoRole;
  label: string;
  desc: string;
  color: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}[] = [
  {
    key: "chief",
    label: "Chief Engineer",
    desc: "Full admin control",
    color: "#f97316",
    icon: Shield,
  },
  {
    key: "site",
    label: "Site Engineer",
    desc: "Labour & progress",
    color: "#0ea5e9",
    icon: Users,
  },
  {
    key: "materials",
    label: "Materials Engineer",
    desc: "Inventory & stock",
    color: "#10b981",
    icon: Package,
  },
  {
    key: "owner",
    label: "Site Owner",
    desc: "View reports",
    color: "#8b5cf6",
    icon: BarChart2,
  },
];

const DEMO_WORKERS = [
  { name: "Rajesh Kumar", skill: "Mason", rate: 600, status: "Active" },
  { name: "Sudhir Singh", skill: "Carpenter", rate: 700, status: "Active" },
  { name: "Mohan Lal", skill: "Electrician", rate: 800, status: "Active" },
  { name: "Amar Nath", skill: "Plumber", rate: 750, status: "Active" },
  { name: "Vijay Kumar", skill: "Helper", rate: 400, status: "Active" },
];

const DEMO_MATERIALS = [
  {
    name: "Bricks (Red)",
    unit: "pieces",
    stock: 5000,
    reorder: 1000,
    price: 8,
    status: "OK",
  },
  {
    name: "Cement (OPC 53)",
    unit: "bags",
    stock: 200,
    reorder: 50,
    price: 380,
    status: "OK",
  },
  {
    name: "Gravel",
    unit: "tons",
    stock: 15,
    reorder: 5,
    price: 1200,
    status: "OK",
  },
  {
    name: "Paint (White)",
    unit: "liters",
    stock: 25,
    reorder: 20,
    price: 120,
    status: "Low",
  },
  {
    name: "Sand (Fine)",
    unit: "tons",
    stock: 4,
    reorder: 5,
    price: 900,
    status: "Critical",
  },
  {
    name: "Steel Bars (12mm)",
    unit: "kg",
    stock: 2000,
    reorder: 500,
    price: 68,
    status: "OK",
  },
  {
    name: "Timber (Teak)",
    unit: "pieces",
    stock: 50,
    reorder: 10,
    price: 850,
    status: "OK",
  },
  {
    name: "Wire (Electrical)",
    unit: "kg",
    stock: 150,
    reorder: 30,
    price: 95,
    status: "OK",
  },
];

const DEMO_PROGRESS = [
  { date: "2024-11-01", pct: 10, notes: "Foundation completed" },
  { date: "2024-11-05", pct: 22, notes: "1st floor slab cast" },
  { date: "2024-11-10", pct: 35, notes: "2nd floor brickwork done" },
  { date: "2024-11-15", pct: 45, notes: "Plastering started" },
];

const DEMO_AUDIT = [
  {
    time: "2024-11-01 09:00",
    user: "Arjun Ramesh",
    action: "Created Project",
    module: "Admin",
  },
  {
    time: "2024-11-02 10:30",
    user: "Priya Nair",
    action: "Added Worker Rajesh Kumar",
    module: "Labour",
  },
  {
    time: "2024-11-03 11:00",
    user: "Dinesh Babu",
    action: "Added Cement - 250 bags",
    module: "Materials",
  },
  {
    time: "2024-11-10 14:00",
    user: "Priya Nair",
    action: "Progress updated to 35%",
    module: "Progress",
  },
  {
    time: "2024-11-15 16:00",
    user: "Dinesh Babu",
    action: "Steel Bars 500kg received",
    module: "Materials",
  },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function ChiefView() {
  const totalValue = DEMO_MATERIALS.reduce((s, m) => s + m.stock * m.price, 0);
  const totalWages = DEMO_WORKERS.reduce((s, w) => s + w.rate * 20, 0); // 20 days
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Workers</p>
            <p className="text-2xl font-bold">{DEMO_WORKERS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Materials Value</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Completion</p>
            <p className="text-2xl font-bold">45%</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
              <div
                className="h-1.5 rounded-full bg-[#f97316]"
                style={{ width: "45%" }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Labour Cost</p>
            <p className="text-xl font-bold">{formatCurrency(totalWages)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Worker List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_WORKERS.map((w) => (
                <TableRow key={w.name}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.skill}</TableCell>
                  <TableCell>₹{w.rate}/day</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">
                      {w.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_AUDIT.map((e) => (
                <TableRow key={e.time}>
                  <TableCell className="text-xs text-slate-500">
                    {e.time}
                  </TableCell>
                  <TableCell className="text-sm">{e.user}</TableCell>
                  <TableCell className="text-sm">{e.action}</TableCell>
                  <TableCell>
                    <Badge className="bg-slate-100 text-slate-600 text-xs">
                      {e.module}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SiteView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Workers On Site</p>
            <p className="text-2xl font-bold">{DEMO_WORKERS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Today Present</p>
            <p className="text-2xl font-bold text-green-600">
              4 / {DEMO_WORKERS.length}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Today&apos;s Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DEMO_WORKERS.map((w, wi) => (
              <div
                key={w.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
              >
                <span className="text-sm font-medium">
                  {w.name} — {w.skill}
                </span>
                <Badge
                  className={
                    wi < 4
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }
                >
                  {wi < 4 ? "Present" : "Absent"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progress History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg
              viewBox="0 0 36 36"
              className="w-28 h-28 -rotate-90"
              aria-hidden="true"
            >
              <title>Progress</title>
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                strokeDasharray="45 55"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">45%</span>
            </div>
          </div>
          {DEMO_PROGRESS.map((p) => (
            <div
              key={p.date}
              className="flex items-center gap-3 py-2 border-b last:border-0"
            >
              <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] min-w-[3rem] justify-center">
                {p.pct}%
              </Badge>
              <div>
                <p className="text-xs font-medium">{p.date}</p>
                <p className="text-xs text-slate-500">{p.notes}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MaterialsView() {
  const alertCount = DEMO_MATERIALS.filter((m) => m.status !== "OK").length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Materials</p>
            <p className="text-2xl font-bold">{DEMO_MATERIALS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-orange-500">{alertCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Value</p>
            <p className="text-xl font-bold">
              {formatCurrency(
                DEMO_MATERIALS.reduce((s, m) => s + m.stock * m.price, 0),
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">GRN Records</p>
            <p className="text-2xl font-bold">4</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Inventory (A–Z)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reorder</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_MATERIALS.map((m) => (
                  <TableRow key={m.name}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell>{m.stock}</TableCell>
                    <TableCell>{m.reorder}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          m.status === "OK"
                            ? "bg-green-100 text-green-700"
                            : m.status === "Low"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {m.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {alertCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_MATERIALS.filter((m) => m.status !== "OK").map((m) => (
              <div
                key={m.name}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium text-orange-800">{m.name}</span>
                <Badge
                  className={
                    m.status === "Critical"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {m.status}: {m.stock} {m.unit}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OwnerView() {
  const totalValue = DEMO_MATERIALS.reduce((s, m) => s + m.stock * m.price, 0);
  const totalWages = DEMO_WORKERS.reduce((s, w) => s + w.rate * 20, 0);
  const budget = 5000000;
  const spent = totalValue + totalWages;
  const pct = Math.round((spent / budget) * 100);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Completion</p>
            <p className="text-2xl font-bold">45%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Workers</p>
            <p className="text-2xl font-bold">{DEMO_WORKERS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Materials Value</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Labour Cost</p>
            <p className="text-xl font-bold">{formatCurrency(totalWages)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Budget vs Actual</span>
            <span className="text-sm text-slate-500">
              {formatCurrency(spent)} / {formatCurrency(budget)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-[#10b981]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{pct}% of budget used</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              {
                period: "Week 1 (Nov 2024)",
                amount: 28400,
                status: "approved",
              },
              { period: "Week 2 (Nov 2024)", amount: 31200, status: "pending" },
            ].map((p) => (
              <div
                key={p.period}
                className="flex justify-between items-center p-2 rounded-lg bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium">{p.period}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(p.amount)}
                  </p>
                </div>
                <Badge
                  className={
                    p.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DemoPage() {
  useEffect(() => {
    ensureDemoSeeded();
  }, []);
  const [activeRole, setActiveRole] = useState<DemoRole>("chief");

  const currentRole = ROLES.find((r) => r.key === activeRole)!;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Demo Banner */}
      <div className="bg-amber-500 text-white py-2 text-center text-sm font-semibold">
        🛠 DEMO MODE — Exploring with sample data. No login required.
        <Link to="/login" className="ml-3 underline hover:no-underline">
          Log in for full access →
        </Link>
      </div>

      {/* Header */}
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
          <Link to="/login">
            <Button
              size="sm"
              className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
            >
              Sign In / Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">
            Interactive Demo
          </h1>
          <p className="text-slate-500 text-sm">
            Switch between roles to see what each user sees and can do.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setActiveRole(r.key)}
                className="p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md"
                style={
                  activeRole === r.key
                    ? { borderColor: r.color, backgroundColor: `${r.color}10` }
                    : { borderColor: "#e2e8f0", backgroundColor: "white" }
                }
              >
                <Icon className="w-5 h-5 mb-2" style={{ color: r.color }} />
                <p
                  className="font-semibold text-sm"
                  style={{ color: activeRole === r.key ? r.color : "#4a5568" }}
                >
                  {r.label}
                </p>
                <p className="text-xs text-slate-400">{r.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Active Role Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${currentRole.color}15` }}
          >
            <currentRole.icon
              className="w-5 h-5"
              style={{ color: currentRole.color }}
            />
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a]">
              {currentRole.label} View
            </h2>
            <p className="text-xs text-slate-500">
              Project: Project Alpha (Demo)
            </p>
          </div>
          <Badge
            className="ml-auto"
            style={{
              backgroundColor: `${currentRole.color}15`,
              color: currentRole.color,
            }}
          >
            {currentRole.desc}
          </Badge>
        </div>

        {/* Demo Content */}
        {activeRole === "chief" && <ChiefView />}
        {activeRole === "site" && <SiteView />}
        {activeRole === "materials" && <MaterialsView />}
        {activeRole === "owner" && <OwnerView />}

        {/* CTA */}
        <div className="mt-10 bg-[#f97316] rounded-2xl p-6 text-white text-center">
          <CheckCircle className="w-8 h-8 text-[#f97316] mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">
            Ready to manage your real project?
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Sign up free. No domain restriction. Start from scratch.
          </p>
          <Link to="/signup">
            <Button className="bg-[#f97316] hover:bg-[#ea6c10] text-white px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} ConstructManager Pro &bull; Built with
        ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f97316] hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
