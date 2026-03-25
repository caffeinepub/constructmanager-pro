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
  BarChart2,
  Bell,
  Calculator,
  CheckCircle,
  HardHat,
  Lock,
  MapPin,
  Menu,
  Monitor,
  Package,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const materialData = [
  { name: "Cement", stock: 180, reorder: 200 },
  { name: "Steel", stock: 450, reorder: 150 },
  { name: "Sand", stock: 800, reorder: 300 },
  { name: "Bricks", stock: 1200, reorder: 400 },
];

const workers = [
  {
    name: "Rajesh Kumar",
    initials: "RK",
    clockIn: "07:45 AM",
    clockOut: "05:30 PM",
    wage: "₹520",
  },
  {
    name: "Sanjay Mehta",
    initials: "SM",
    clockIn: "08:00 AM",
    clockOut: "05:00 PM",
    wage: "₹480",
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    clockIn: "07:30 AM",
    clockOut: "06:00 PM",
    wage: "₹560",
  },
  {
    name: "Arjun Verma",
    initials: "AV",
    clockIn: "08:15 AM",
    clockOut: "05:45 PM",
    wage: "₹500",
  },
];

const roles = [
  {
    icon: Shield,
    title: "Chief Engineer",
    description: "Full oversight, master reports, approval power.",
    permissions: [
      "Approve all requests",
      "View master reports",
      "Manage all modules",
      "System configuration",
    ],
    color: "bg-[#0B2B45]",
    roleSlug: "chief-engineer",
  },
  {
    icon: BarChart2,
    title: "Site Owner",
    description: "Financial dashboards, project progress tracking.",
    permissions: [
      "Financial reports",
      "Project analytics",
      "Budget monitoring",
      "Progress tracking",
    ],
    color: "bg-[#F28C2A]",
    roleSlug: "site-owner",
  },
  {
    icon: Users,
    title: "Site Engineer",
    description:
      "Labour management, attendance verification, material requests.",
    permissions: [
      "Labour management",
      "Attendance verification",
      "Material requests",
      "Daily reports",
    ],
    color: "bg-[#1FA6A3]",
    roleSlug: "site-engineer",
  },
  {
    icon: Package,
    title: "Material Engineer",
    description: "Material inward/outward, stock updates, reorder alerts.",
    permissions: [
      "Stock management",
      "Inward/outward entries",
      "Reorder alerts",
      "Vendor coordination",
    ],
    color: "bg-[#0B2B45]",
    roleSlug: "materials-engineer",
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "Real-time Stock Analysis",
    desc: "Monitor material levels with live dashboards and instant updates.",
    color: "bg-[#1FA6A3]",
  },
  {
    icon: MapPin,
    title: "GPS-enabled Attendance",
    desc: "Verify worker presence with GPS clock-in/out from any location.",
    color: "bg-[#F28C2A]",
  },
  {
    icon: Bell,
    title: "Automated Reorder Alerts",
    desc: "Get notified instantly when materials fall below threshold levels.",
    color: "bg-[#0B2B45]",
  },
  {
    icon: Calculator,
    title: "Daily Wage Ledger",
    desc: "Automated wage calculations based on attendance and shift data.",
    color: "bg-[#1FA6A3]",
  },
  {
    icon: Lock,
    title: "Role-Based Permissions",
    desc: "Granular access control across all modules and operations.",
    color: "bg-[#F28C2A]",
  },
  {
    icon: Monitor,
    title: "Cross-Platform (Mobile & Web)",
    desc: "Seamless experience across desktop, tablet, and mobile devices.",
    color: "bg-[#0B2B45]",
  },
];

const navLinks = [
  { label: "Roles", href: "#roles" },
  { label: "Materials", href: "#materials" },
  { label: "Labour", href: "#labour" },
  { label: "Features", href: "#features" },
  { label: "Team", href: "#team" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "#0B2B45" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F28C2A] flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              ConstructManager Pro
            </span>
            <span className="text-white font-bold text-base sm:hidden">
              CMP
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[#93A4B5] hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#93A4B5]/40 text-[#93A4B5] bg-transparent hover:bg-white/10 hover:text-white"
                data-ocid="nav.login.button"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="rounded-full font-semibold"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
                data-ocid="nav.signup.button"
              >
                Sign Up
              </Button>
            </Link>
          </div>
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            data-ocid="nav.mobile.toggle"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div
          className="md:hidden px-4 pb-4 space-y-2"
          style={{ backgroundColor: "#071E30" }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-[#93A4B5] hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#93A4B5]/40 text-[#93A4B5] bg-transparent"
                data-ocid="nav.mobile.login.button"
              >
                Login
              </Button>
            </Link>
            <Link
              to="/signup"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              <Button
                className="w-full rounded-full"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
                data-ocid="nav.mobile.signup.button"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section
      className="hex-pattern relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #071E30 0%, #0B2B45 60%, #0E3459 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <Badge
              className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(242,140,42,0.15)",
                color: "#F28C2A",
                border: "1px solid rgba(242,140,42,0.3)",
              }}
            >
              Construction Site Management
            </Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              ConstructManager<span style={{ color: "#F28C2A" }}> Pro</span>
            </h1>
            <p className="text-xl text-[#93A4B5] font-medium">
              Integrated Material &amp; Labour Management for Construction
              Sites.
            </p>
            <p className="text-[#93A4B5] leading-relaxed">
              Transform your construction operations with a unified digital
              platform that delivers real-time visibility into materials,
              attendance, and project progress — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button
                  data-ocid="hero.signup.button"
                  size="lg"
                  className="rounded-full font-semibold uppercase tracking-wide px-8"
                  style={{ backgroundColor: "#F28C2A", color: "white" }}
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  data-ocid="hero.login.button"
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold uppercase tracking-wide px-8"
                  style={{
                    borderColor: "rgba(147,164,181,0.4)",
                    color: "#93A4B5",
                    backgroundColor: "transparent",
                  }}
                >
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-shadow relative">
              <img
                src="/assets/generated/hero-construction.dim_1200x600.jpg"
                alt="Construction site"
                className="w-full h-auto object-cover rounded-2xl"
                style={{ maxHeight: "400px" }}
              />
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-[#0B2B45]">
                      Live Tracking Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-[#0B2B45]/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg">
                  <div className="text-xs text-[#93A4B5]">Total Workers</div>
                  <div className="text-white font-bold text-lg">247</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section
      id="roles"
      className="py-20"
      style={{ backgroundColor: "#F4F7FA" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2B45] mb-3">
            Role-Based Access Hierarchy
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            Every stakeholder gets tailored access and controls based on their
            responsibilities.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card
                className="h-full card-shadow border-border hover:scale-[1.02] transition-transform flex flex-col"
                data-ocid={`roles.item.${i + 1}`}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${role.color}`}
                  >
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-base text-[#0B2B45]">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-[#6B7280] mb-4">
                    {role.description}
                  </p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {role.permissions.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 text-xs text-[#6B7280]"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#1FA6A3" }}
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" search={{ role: role.roleSlug }}>
                    <Button
                      size="sm"
                      className="w-full rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#F28C2A", color: "white" }}
                      data-ocid={`roles.signup.button.${i + 1}`}
                    >
                      Sign Up as {role.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2B45] mb-3">
            Platform Capabilities
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            Everything you need to run a modern, digitally-driven construction
            operation.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card
                className="h-full card-shadow border-border hover:scale-[1.02] transition-transform"
                data-ocid={`features.item.${i + 1}`}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                  >
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[#0B2B45] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaterialsSection() {
  return (
    <section id="materials" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2B45] mb-3">
            Material Management Dashboard
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            Complete visibility into material stock, consumption, and reorder
            thresholds.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="card-shadow border-border"
              data-ocid="materials.table"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#0B2B45]">
                  Stock Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                      <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                        Material
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                        Current Stock
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                        Reorder Level
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialData.map((m, i) => (
                      <TableRow
                        key={m.name}
                        data-ocid={`materials.row.${i + 1}`}
                        style={
                          m.stock < m.reorder
                            ? { backgroundColor: "rgba(239,68,68,0.06)" }
                            : {}
                        }
                      >
                        <TableCell className="font-medium text-sm">
                          {m.name}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-semibold ${m.stock < m.reorder ? "text-red-600" : "text-[#0B2B45]"}`}
                        >
                          {m.stock}
                        </TableCell>
                        <TableCell className="text-sm text-[#6B7280]">
                          {m.reorder}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px] px-1.5 py-0"
                            style={
                              m.stock < m.reorder
                                ? {
                                    backgroundColor: "rgba(239,68,68,0.15)",
                                    color: "#DC2626",
                                  }
                                : {
                                    backgroundColor: "rgba(31,166,163,0.1)",
                                    color: "#1FA6A3",
                                  }
                            }
                          >
                            {m.stock < m.reorder ? "LOW" : "OK"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="card-shadow border-border h-full"
              data-ocid="materials.chart"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#0B2B45]">
                  Stock vs Reorder Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={materialData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF2" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E6EBF2",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="stock"
                      name="Current Stock"
                      radius={[4, 4, 0, 0]}
                    >
                      {materialData.map((entry) => (
                        <Cell
                          key={`stock-${entry.name}`}
                          fill={
                            entry.stock < entry.reorder ? "#DC2626" : "#0B2B45"
                          }
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="reorder"
                      name="Reorder Level"
                      fill="#F28C2A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LabourSection() {
  return (
    <section
      id="labour"
      className="py-20"
      style={{ backgroundColor: "#F4F7FA" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2B45] mb-3">
            Labour &amp; Attendance Tracking
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            GPS-verified attendance with automated daily wage computation and
            ledger management.
          </p>
        </motion.div>
        <Card className="card-shadow border-border" data-ocid="labour.table">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#0B2B45]">
                Today's Attendance
              </CardTitle>
              <Badge
                style={{
                  backgroundColor: "rgba(31,166,163,0.1)",
                  color: "#1FA6A3",
                }}
              >
                Mar 25, 2026
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Worker
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Clock In
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Clock Out
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    GPS
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Daily Wage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w, i) => (
                  <TableRow key={w.name} data-ocid={`labour.item.${i + 1}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            backgroundColor:
                              i % 2 === 0 ? "#0B2B45" : "#1FA6A3",
                          }}
                        >
                          {w.initials}
                        </div>
                        <span className="text-sm font-medium text-[#0B2B45]">
                          {w.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {w.clockIn}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {w.clockOut}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: "rgba(31,166,163,0.1)",
                          color: "#1FA6A3",
                        }}
                      >
                        ✓ Verified
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-[#0B2B45]">
                      {w.wage}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function TeamSection() {
  const members = [
    {
      name: "Mohamed Asif M",
      role: "Chairman",
      email: "mohamedasif.ce23@krct.ac.in",
      image:
        "/assets/uploads/mohamed_asif_m-019d2137-fc1c-725f-850e-007b024c42ab-2.png",
    },
    {
      name: "Raksha Manikandan M",
      role: "President",
      email: "rakshamanikandan.ce23@krct.ac.in",
      image:
        "/assets/uploads/raksha_manikandan_m-019d2138-02c2-7368-a7b5-e0fae8e9a060-4.png",
    },
    {
      name: "Kumaran Bala",
      role: "Vice President",
      email: "kumaranbala.ce23@krct.ac.in",
      image:
        "/assets/uploads/kumaran_bala-019d2137-fc07-76ee-9225-b8a357eb3e63-1.png",
    },
    {
      name: "Aswin M",
      role: "CEO",
      email: "aswin.ce23@krct.ac.in",
      image:
        "/assets/uploads/aswin_m-019d2137-fd4c-77ab-b14a-5efea6ad48a2-3.png",
    },
  ];
  return (
    <section id="team" style={{ background: "#0B2B45" }} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Meet the Team
          </h2>
          <p className="text-[#93A4B5] text-lg">
            The developers behind ConstructManager Pro
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {members.map((member, i) => (
            <motion.div
              key={member.email}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              data-ocid={`team.item.${i + 1}`}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover object-top mx-auto border-4 border-[#F28C2A] mb-4"
              />
              <h3 className="font-bold text-[#0B2B45] text-base mb-1">
                {member.name}
              </h3>
              <p className="text-[#F28C2A] font-semibold text-sm mb-3">
                {member.role}
              </p>
              <a
                href={`mailto:${member.email}`}
                className="text-[#1FA6A3] text-xs hover:underline break-all"
              >
                {member.email}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  return (
    <footer style={{ backgroundColor: "#071E30" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#F28C2A] flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-base">
                ConstructManager Pro
              </span>
            </div>
            <p className="text-[#93A4B5] text-sm leading-relaxed">
              Empowering construction sites with digital transparency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[#93A4B5] text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2">
              {[
                {
                  name: "Mohamed Asif M",
                  email: "mohamedasif.ce23@krct.ac.in",
                },
                { name: "Kumaran Bala", email: "kumaranbala.ce23@krct.ac.in" },
                { name: "Aswin M", email: "aswin.ce23@krct.ac.in" },
                {
                  name: "Raksha Manikandan M",
                  email: "rakshamanikandan.ce23@krct.ac.in",
                },
              ].map((c) => (
                <li key={c.email}>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-[#93A4B5] text-xs hover:text-white transition-colors"
                  >
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#93A4B5] text-sm">
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F28C2A] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-[#93A4B5]/40 text-[#93A4B5] bg-transparent hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="rounded-full"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <RolesSection />
        <MaterialsSection />
        <LabourSection />
        <FeaturesSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
