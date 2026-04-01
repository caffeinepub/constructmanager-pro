import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  BookOpen,
  CheckCircle,
  ClipboardList,
  HardHat,
  Key,
  Lock,
  Package,
  Plus,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";

interface Step {
  num: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tip?: string;
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#f97316]/40 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#f97316]" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded-full">
            Step {step.num}
          </span>
          <h3 className="font-semibold text-[#0f172a] text-sm">{step.title}</h3>
        </div>
        <p className="text-sm text-slate-600">{step.desc}</p>
        {step.tip && (
          <div className="mt-2 flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">{step.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_START: Step[] = [
  {
    num: 1,
    title: "Sign Up for an Account",
    desc: 'Click "Sign Up" on the home page. Enter your Full Name, Email, and create a Password. Choose your Role (Chief Engineer, Site Engineer, Materials Engineer, or Site Owner).',
    icon: UserPlus,
    tip: "Use any valid email address. No domain restriction. Your role determines what you can see and do.",
  },
  {
    num: 2,
    title: "Create or Join a Project",
    desc: 'After login, you\'ll see the Projects Dashboard. Click "New Project" to create one, or "Join Project" to enter an existing project\'s Team Code.',
    icon: Plus,
    tip: "Every project has a Team Code (short PIN) and a Project Password. Chief Engineers can change these at any time.",
  },
  {
    num: 3,
    title: "Enter Your Project",
    desc: "Click your project card. If it's locked, enter the Team Code to gain access. Your session will remember it until logout.",
    icon: Lock,
    tip: "Team Code is cached for your session — you won't be asked again until you log out.",
  },
  {
    num: 4,
    title: "Navigate Your Dashboard",
    desc: "Use the sidebar to navigate between modules: Overview, Attendance/Labour, Materials, Progress, and Notifications. Your role determines available modules.",
    icon: BarChart2,
    tip: "The Help (?) button in the top bar opens this manual anytime.",
  },
  {
    num: 5,
    title: "Perform Your Daily Tasks",
    desc: "Site Engineers mark attendance, update progress, and add workers. Materials Engineers manage inventory and record GRNs. Chief Engineers oversee everything and approve requests.",
    icon: ClipboardList,
  },
];

const CE_STEPS: Step[] = [
  {
    num: 1,
    title: "Sign Up as Chief Engineer",
    desc: 'During registration, select "Chief Engineer" as your role. This gives you the highest-level access.',
    icon: Shield,
  },
  {
    num: 2,
    title: "Create a New Project",
    desc: 'From Projects Dashboard, click "New Project". Set the Project Name, a Team Code (4–6 char PIN that members use to join), and a Project Password (for sensitive operations).',
    icon: Plus,
    tip: "New projects start at 0% completion. Milestones and labour are blank — add them fresh.",
  },
  {
    num: 3,
    title: "Manage Project Members",
    desc: "In the Admin Panel → Manage Users tab, add team members by email and assign their roles. You can also remove members at any time.",
    icon: Users,
  },
  {
    num: 4,
    title: "Monitor Labour & Attendance",
    desc: "View the Labour tab to see all workers, hours, and daily wages. You can approve or override payroll submissions from the Admin Panel → Override Approvals tab.",
    icon: Users,
  },
  {
    num: 5,
    title: "Oversee Material Inventory",
    desc: "The Materials tab shows all inventory sorted alphabetically. Review stock levels, low-stock alerts, and supplier details.",
    icon: Package,
  },
  {
    num: 6,
    title: "Change Team Code or Password",
    desc: "Admin Panel → Change Passcode tab lets you update the Team Code and Project Password. All active sessions are invalidated immediately.",
    icon: Key,
    tip: "Notify your team members after changing the Team Code — they'll need the new one to re-enter.",
  },
  {
    num: 7,
    title: "Review Audit Log",
    desc: "The Audit Log tab shows a timestamped history of all actions across the project for full transparency and accountability.",
    icon: BookOpen,
  },
];

const SE_STEPS: Step[] = [
  {
    num: 1,
    title: "Sign Up as Site Engineer",
    desc: 'Register with your email and choose "Site Engineer" as your role.',
    icon: UserPlus,
  },
  {
    num: 2,
    title: "Join or Create a Project",
    desc: 'On the Projects Dashboard, use "New Project" to create your own, or "Join Project" to enter an existing project\'s Team Code.',
    icon: Lock,
    tip: "Only Chief Engineers and Site Engineers can add new labour/workers to a project.",
  },
  {
    num: 3,
    title: "Mark Daily Attendance",
    desc: "Go to the Attendance tab. Toggle each worker between Present and Absent. Clock-in time is auto-stamped when you mark Present.",
    icon: Users,
  },
  {
    num: 4,
    title: "Add New Workers",
    desc: 'In the Attendance tab, scroll to "Add Worker". Enter the worker\'s Name, Type (Mason, Plumber, etc.), and Daily Wage Rate. Click Add.',
    icon: Plus,
    tip: "Site Engineers and Chief Engineers are the only roles that can add workers to a project.",
  },
  {
    num: 5,
    title: "Update Daily Progress",
    desc: "Go to Daily Progress tab. Select a milestone, enter the actual completion percentage, and add notes or observations. Click Update Progress.",
    icon: ClipboardList,
  },
  {
    num: 6,
    title: "Check Notifications",
    desc: "Click the bell icon in the header to see all alerts — low stock, pending approvals, and project updates.",
    icon: AlertTriangle,
  },
];

const ME_STEPS: Step[] = [
  {
    num: 1,
    title: "Sign Up as Materials Engineer",
    desc: 'Register with your email and choose "Materials Engineer" as your role.',
    icon: UserPlus,
  },
  {
    num: 2,
    title: "Join or Create a Project",
    desc: "From the Projects Dashboard, join an existing project using the Team Code, or create a new one.",
    icon: Lock,
  },
  {
    num: 3,
    title: "View Material Inventory",
    desc: "Go to the Inventory tab. All materials are listed alphabetically with stock, reorder level, unit price, and supplier. Low-stock items are highlighted.",
    icon: Package,
    tip: "Materials are always sorted A–Z so you can find items quickly.",
  },
  {
    num: 4,
    title: "Add a New Material",
    desc: 'Scroll to "Add New Material" in the Inventory tab. Fill in Name, Unit, Stock quantity, Reorder level, Unit Price, and Supplier. Click Add.',
    icon: Plus,
  },
  {
    num: 5,
    title: "Record a Goods Receive Note (GRN)",
    desc: "Go to Material Inward (GRN) tab. Select the material received, enter quantity and supplier, add quality check notes, and click Record Inward. Stock updates automatically.",
    icon: ClipboardList,
  },
  {
    num: 6,
    title: "Issue Material (Outward/Consumption)",
    desc: "Go to Consumption tab. Select the material, enter quantity and project stage. Click Issue Material. Stock is deducted automatically.",
    icon: ClipboardList,
  },
  {
    num: 7,
    title: "Monitor Low-Stock Alerts",
    desc: "The Overview tab shows Critical and Low-stock alerts. Notifications appear in the bell menu for any material below reorder level.",
    icon: AlertTriangle,
  },
];

const SO_STEPS: Step[] = [
  {
    num: 1,
    title: "Sign Up as Site Owner",
    desc: 'Register with your email and choose "Site Owner" as your role.',
    icon: UserPlus,
  },
  {
    num: 2,
    title: "Join a Project",
    desc: 'From the Projects Dashboard, use "Join Project" and enter the Team Code provided by your Chief Engineer.',
    icon: Lock,
  },
  {
    num: 3,
    title: "View Executive Dashboard",
    desc: "The Overview tab shows all projects, budget vs. spent, team size, and progress at a glance. This is your high-level command center.",
    icon: BarChart2,
  },
  {
    num: 4,
    title: "Review Labour Summary",
    desc: "The Labour tab shows worker counts, attendance rates, and daily wages per project. This is a read-only view — contact your Site Engineer to add workers.",
    icon: Users,
    tip: "Labour management is handled by Site Engineers and Chief Engineers only.",
  },
  {
    num: 5,
    title: "Review Material Inventory",
    desc: "The Materials tab shows inventory status across all projects. Read-only view — contact your Materials Engineer to update stock.",
    icon: Package,
  },
  {
    num: 6,
    title: "Generate Reports",
    desc: "Go to Reports tab to see project-wise budget summaries, cost breakdowns, and executive reports.",
    icon: ClipboardList,
  },
];

export default function UserManualPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="bg-[#0f172a] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold">
                ConstructManager <span className="text-[#f97316]">Pro</span>
              </h1>
              <p className="text-xs text-slate-400">User Manual</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <Badge className="bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30 mb-3">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Step-by-Step Guide
          </Badge>
          <h2 className="text-3xl font-bold text-[#0f172a] mb-2">
            How to Use ConstructManager Pro
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Follow the steps below for your role to get up and running quickly.
            Each role has its own guide tailored to its responsibilities.
          </p>
        </div>

        <Tabs defaultValue="quickstart">
          <TabsList className="mb-6 bg-white border border-slate-200 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="quickstart"
              className="text-xs data-[state=active]:bg-[#0f172a] data-[state=active]:text-white"
              data-ocid="manual.quickstart.tab"
            >
              🚀 Quick Start
            </TabsTrigger>
            <TabsTrigger
              value="chief"
              className="text-xs data-[state=active]:bg-[#f97316] data-[state=active]:text-white"
              data-ocid="manual.chief.tab"
            >
              🏗 Chief Engineer
            </TabsTrigger>
            <TabsTrigger
              value="site"
              className="text-xs data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white"
              data-ocid="manual.site.tab"
            >
              👷 Site Engineer
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="text-xs data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
              data-ocid="manual.materials.tab"
            >
              📦 Materials Engineer
            </TabsTrigger>
            <TabsTrigger
              value="owner"
              className="text-xs data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white"
              data-ocid="manual.owner.tab"
            >
              🏢 Site Owner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  Quick Start — New User Guide (5 Steps)
                </CardTitle>
                <p className="text-sm text-slate-500">
                  New to ConstructManager Pro? Follow these 5 steps to get
                  started in minutes.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {QUICK_START.map((s) => (
                  <StepCard key={s.num} step={s} />
                ))}
                <div className="mt-4 bg-[#0f172a] rounded-xl p-4 text-white">
                  <p className="text-sm font-semibold mb-1">
                    📌 Demo Credentials
                  </p>
                  <p className="text-xs text-slate-300 mb-2">
                    Want to explore without signing up? Use these demo accounts:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
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
                    ].map((c) => (
                      <div key={c.email} className="bg-white/5 rounded-lg p-3">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: c.color }}
                        >
                          {c.role}
                        </p>
                        <p className="text-xs text-slate-300">{c.email}</p>
                        <p className="text-xs font-mono text-slate-400">
                          {c.pw}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Demo projects: Project Alpha (Team Code: 1234), Site Beta
                    (5678), Tower C (9999)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chief">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#f97316]" />
                  Chief Engineer Guide
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Full admin control over projects, users, materials, labour,
                  and approvals.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {CE_STEPS.map((s) => (
                  <StepCard key={s.num} step={s} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0ea5e9]" />
                  Site Engineer Guide
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Manage daily attendance, workers, and site progress.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {SE_STEPS.map((s) => (
                  <StepCard key={s.num} step={s} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#10b981]" />
                  Materials Engineer Guide
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Manage material inventory, GRNs, issue slips, and stock
                  alerts.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {ME_STEPS.map((s) => (
                  <StepCard key={s.num} step={s} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#8b5cf6]" />
                  Site Owner Guide
                </CardTitle>
                <p className="text-sm text-slate-500">
                  High-level oversight of budgets, progress, and team
                  performance.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {SO_STEPS.map((s) => (
                  <StepCard key={s.num} step={s} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} ConstructManager Pro &bull; Built
            with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f97316] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
