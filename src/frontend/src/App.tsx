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
    textColor: "text-white",
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
    textColor: "text-white",
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
    textColor: "text-white",
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
    textColor: "text-white",
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

const techStack = [
  { name: "React", color: "#61DAFB" },
  { name: "Angular", color: "#DD0031" },
  { name: "Python", color: "#3776AB" },
  { name: "Node.js", color: "#339933" },
  { name: "PostgreSQL", color: "#336791" },
  { name: "AWS", color: "#FF9900" },
  { name: "Azure", color: "#0089D6" },
  { name: "GPS APIs", color: "#1FA6A3" },
];

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Roles", href: "#roles" },
  { label: "Materials", href: "#materials" },
  { label: "Labour", href: "#labour" },
  { label: "Notifications", href: "#notifications" },
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
          {/* Logo */}
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-ocid={`nav.${l.label.toLowerCase()}.link`}
                className="text-sm text-[#93A4B5] hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <a href="#overview">
              <Button
                data-ocid="nav.cta.button"
                className="rounded-full text-xs font-semibold uppercase tracking-wide px-5"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
              >
                Explore the Platform
              </Button>
            </a>
          </div>

          {/* Mobile toggle */}
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

      {/* Mobile menu */}
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
              data-ocid={`nav.mobile.${l.label.toLowerCase()}.link`}
              className="block py-2 text-sm text-[#93A4B5] hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Button
            className="w-full rounded-full text-xs font-semibold uppercase tracking-wide mt-2"
            style={{ backgroundColor: "#F28C2A", color: "white" }}
            data-ocid="nav.mobile.cta.button"
            onClick={() => {
              setOpen(false);
              window.location.href = "#overview";
            }}
          >
            Explore the Platform
          </Button>
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
          {/* Left */}
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
              ConstructManager
              <span style={{ color: "#F28C2A" }}> Pro</span>
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
              <a href="#overview">
                <Button
                  data-ocid="hero.cta.button"
                  size="lg"
                  className="rounded-full font-semibold uppercase tracking-wide px-8"
                  style={{ backgroundColor: "#F28C2A", color: "white" }}
                >
                  Explore the Platform
                </Button>
              </a>
              <a href="#features">
                <Button
                  data-ocid="hero.features.button"
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold uppercase tracking-wide px-8"
                  style={{
                    borderColor: "rgba(147,164,181,0.4)",
                    color: "#93A4B5",
                    backgroundColor: "transparent",
                  }}
                >
                  View Features
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right: hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-shadow relative">
              <img
                src="/assets/generated/hero-construction.dim_1200x600.jpg"
                alt="Construction site with digital overlays"
                className="w-full h-auto object-cover rounded-2xl"
                style={{ maxHeight: "400px" }}
              />
              {/* Overlay badges */}
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

function OverviewSection() {
  return (
    <section id="overview" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0B2B45] mb-3">
            Why ConstructManager Pro?
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            The gap between traditional construction management and modern
            digital efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full card-shadow border-border">
              <CardHeader className="pb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(242,140,42,0.1)" }}
                >
                  <X className="w-6 h-6" style={{ color: "#F28C2A" }} />
                </div>
                <CardTitle className="text-xl text-[#0B2B45]">
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6B7280] leading-relaxed">
                  Construction sites relying on manual processes face chronic
                  inefficiencies. Paperwork-driven attendance leads to inflated
                  labour costs. Untracked material consumption causes unexpected
                  stockouts and project delays. Without real-time visibility,
                  cost overruns go undetected until it's too late — often
                  derailing entire project timelines and budgets.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Project delays due to stockouts",
                    "Labour fraud and inflated wages",
                    "No real-time material visibility",
                    "Manual reporting errors",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#6B7280]"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#F28C2A" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="h-full card-shadow border-border">
              <CardHeader className="pb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(31,166,163,0.1)" }}
                >
                  <CheckCircle
                    className="w-6 h-6"
                    style={{ color: "#1FA6A3" }}
                  />
                </div>
                <CardTitle className="text-xl text-[#0B2B45]">
                  The Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6B7280] leading-relaxed">
                  ConstructManager Pro is a centralized digital platform
                  purpose-built for construction sites. With real-time material
                  tracking, GPS-verified attendance, automated reorder alerts,
                  and role-based access control, every stakeholder gets exactly
                  the information they need — when they need it.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Real-time material & stock tracking",
                    "GPS-verified attendance system",
                    "Automated alerts & notifications",
                    "Role-based access for all users",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#6B7280]"
                    >
                      <CheckCircle
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#1FA6A3" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
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
                className="h-full card-shadow border-border hover:scale-[1.02] transition-transform"
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
                <CardContent>
                  <p className="text-sm text-[#6B7280] mb-4">
                    {role.description}
                  </p>
                  <ul className="space-y-1.5">
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
          {/* Table */}
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
                        Unit Price
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                        Last Update
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      data-ocid="materials.row.1"
                      style={{ backgroundColor: "rgba(239,68,68,0.06)" }}
                    >
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          Cement
                          <Badge
                            className="text-[10px] px-1.5 py-0"
                            style={{
                              backgroundColor: "rgba(239,68,68,0.15)",
                              color: "#DC2626",
                            }}
                          >
                            LOW
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-red-600">
                        180 bags
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        200 bags
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        ₹320/bag
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        2h ago
                      </TableCell>
                    </TableRow>
                    <TableRow data-ocid="materials.row.2">
                      <TableCell className="font-medium text-sm">
                        Steel Rods
                      </TableCell>
                      <TableCell className="text-sm text-[#0B2B45] font-semibold">
                        450 units
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        150 units
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        ₹850/unit
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        4h ago
                      </TableCell>
                    </TableRow>
                    <TableRow data-ocid="materials.row.3">
                      <TableCell className="font-medium text-sm">
                        Sand
                      </TableCell>
                      <TableCell className="text-sm text-[#0B2B45] font-semibold">
                        800 bags
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        300 bags
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        ₹45/bag
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        1h ago
                      </TableCell>
                    </TableRow>
                    <TableRow data-ocid="materials.row.4">
                      <TableCell className="font-medium text-sm">
                        Bricks
                      </TableCell>
                      <TableCell className="text-sm text-[#0B2B45] font-semibold">
                        1200 units
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        400 units
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        ₹8/unit
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        30m ago
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar chart */}
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
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Worker table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card
              className="card-shadow border-border"
              data-ocid="labour.table"
            >
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
                    Mar 24, 2026
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

            {/* Summary + Button */}
            <div className="flex flex-wrap gap-4 mt-4 items-center">
              <Card
                className="card-shadow border-border flex-1"
                data-ocid="labour.summary.card"
              >
                <CardContent className="py-4 px-5">
                  <div className="flex justify-around">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#0B2B45]">
                        24
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        Total Present
                      </div>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#1FA6A3" }}
                      >
                        ₹18,400
                      </div>
                      <div className="text-xs text-[#6B7280]">Total Wages</div>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#0B2B45]">3</div>
                      <div className="text-xs text-[#6B7280]">Absent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                data-ocid="labour.mark_attendance.button"
                className="rounded-full font-semibold uppercase tracking-wide px-6"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
              >
                Mark Attendance
              </Button>
            </div>
          </motion.div>

          {/* Calendar mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card
              className="card-shadow border-border h-full"
              data-ocid="labour.calendar.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#0B2B45]">
                  March 2026
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-xs font-semibold text-[#6B7280] py-1"
                      >
                        {d}
                      </div>
                    ),
                  )}
                  {/* Empty cells for March 1 starting on Sunday */}
                  {["p1", "p2", "p3", "p4", "p5", "p6"].map((p) => (
                    <div key={p} />
                  ))}
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isToday = day === 24;
                    const isPresent =
                      day < 24 && day % 7 !== 0 && day % 7 !== 6;
                    return (
                      <div
                        key={day}
                        className={`text-xs rounded-full w-7 h-7 mx-auto flex items-center justify-center font-medium ${
                          isToday
                            ? "text-white"
                            : isPresent
                              ? "text-[#1FA6A3]"
                              : "text-[#6B7280]"
                        }`}
                        style={
                          isToday
                            ? { backgroundColor: "#F28C2A" }
                            : isPresent
                              ? { backgroundColor: "rgba(31,166,163,0.1)" }
                              : {}
                        }
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "rgba(31,166,163,0.3)" }}
                      />
                      <span className="text-[#6B7280]">Present days</span>
                    </div>
                    <span className="font-semibold text-[#0B2B45]">18</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#F28C2A" }}
                      />
                      <span className="text-[#6B7280]">Today</span>
                    </div>
                    <span className="font-semibold text-[#0B2B45]">Mar 24</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#6B7280]/20" />
                      <span className="text-[#6B7280]">Weekend</span>
                    </div>
                    <span className="font-semibold text-[#0B2B45]">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const notifications = [
  {
    icon: "🔴",
    priority: "HIGH",
    priorityColor: "#DC2626",
    priorityBg: "rgba(220,38,38,0.12)",
    message: "Low stock alert: Cement below 200 bags",
    detail: "Current stock: 180 bags — reorder immediately",
    time: "10 min ago",
  },
  {
    icon: "🟢",
    priority: "INFO",
    priorityColor: "#16A34A",
    priorityBg: "rgba(22,163,74,0.12)",
    message: "Material delivery confirmed: 500 steel rods received",
    detail: "Delivery by FastCargo Logistics — verified by Material Engineer",
    time: "1 hour ago",
  },
  {
    icon: "🟡",
    priority: "MEDIUM",
    priorityColor: "#D97706",
    priorityBg: "rgba(217,119,6,0.12)",
    message: "Attendance approved by Site Engineer",
    detail: "24 workers marked present for today's shift",
    time: "2 hours ago",
  },
];

function NotificationsSection() {
  return (
    <section
      id="notifications"
      style={{
        background: "linear-gradient(135deg, #071E30 0%, #0B2B45 100%)",
      }}
      className="py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Real-Time Notifications &amp; Alerts
          </h2>
          <p className="text-[#93A4B5] max-w-xl mx-auto">
            Stay ahead of every issue with intelligent, priority-based alerting
            across all modules.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {notifications.map((n, notifIdx) => (
            <motion.div
              key={n.priority}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: notifIdx * 0.12 }}
              data-ocid={`notifications.item.initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}`}
            >
              <Card
                className="h-full border-0"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{n.icon}</span>
                    <Badge
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: n.priorityBg,
                        color: n.priorityColor,
                        border: "none",
                      }}
                    >
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="text-white font-semibold text-sm mb-2">
                    {n.message}
                  </p>
                  <p className="text-[#93A4B5] text-xs mb-4">{n.detail}</p>
                  <div className="text-[#93A4B5] text-xs">{n.time}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            data-ocid="notifications.view_all.button"
            variant="outline"
            className="rounded-full font-semibold uppercase tracking-wide px-8"
            style={{
              borderColor: "rgba(147,164,181,0.4)",
              color: "#93A4B5",
              backgroundColor: "transparent",
            }}
          >
            View All Notifications
          </Button>
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

function TechStackSection() {
  return (
    <section className="py-16" style={{ backgroundColor: "#F4F7FA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-[#0B2B45] mb-3">
            Built With Modern Technology
          </h2>
          <p className="text-[#6B7280]">
            Enterprise-grade, cloud-native stack for reliability and
            scalability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-white rounded-xl px-5 py-3 flex items-center gap-3 card-shadow border border-border"
              data-ocid={`tech.${tech.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.card`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tech.color }}
              />
              <span className="font-semibold text-sm text-[#0B2B45]">
                {tech.name}
              </span>
            </div>
          ))}
        </motion.div>
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="text-[#F28C2A] text-xs hover:underline break-all"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
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

          {/* Quick Links */}
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

          {/* Modules */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Modules
            </h4>
            <ul className="space-y-2">
              {[
                "Material Management",
                "Attendance Tracking",
                "Wage Ledger",
                "Notifications",
                "Role Management",
              ].map((m) => (
                <li key={m}>
                  <span className="text-[#93A4B5] text-sm">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <a
              href="mailto:mohamedasif.ce23@krct.ac.in"
              className="block text-[#93A4B5] text-sm mb-2 hover:text-white transition-colors"
            >
              mohamedasif.ce23@krct.ac.in
            </a>
            <a
              href="mailto:kumaranbala.ce23@krct.ac.in"
              className="block text-[#93A4B5] text-sm mb-2 hover:text-white transition-colors"
            >
              kumaranbala.ce23@krct.ac.in
            </a>
            <a
              href="mailto:aswin.ce23@krct.ac.in"
              className="block text-[#93A4B5] text-sm mb-2 hover:text-white transition-colors"
            >
              aswin.ce23@krct.ac.in
            </a>
            <a
              href="mailto:rakshamanikandan.ce23@krct.ac.in"
              className="block text-[#93A4B5] text-sm hover:text-white transition-colors"
            >
              rakshamanikandan.ce23@krct.ac.in
            </a>
          </div>
        </div>

        <div
          className="border-t pt-6"
          style={{ borderColor: "rgba(147,164,181,0.2)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[#93A4B5] text-sm">
              © {year} ConstructManager Pro. All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#93A4B5] text-sm hover:text-white transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <RolesSection />
        <MaterialsSection />
        <LabourSection />
        <NotificationsSection />
        <FeaturesSection />
        <TechStackSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
