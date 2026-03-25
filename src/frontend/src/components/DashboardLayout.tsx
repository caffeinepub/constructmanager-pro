import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  ChevronRight,
  ClipboardList,
  FileText,
  HardHat,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { type UserRole, roleToLabel, useAuth } from "../AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<UserRole, NavItem[]> = {
  siteEngineer: [
    { label: "Dashboard", href: "/dashboard/site-engineer", icon: Home },
    {
      label: "My Tasks",
      href: "/dashboard/site-engineer",
      icon: ClipboardList,
    },
    { label: "Daily Log", href: "/dashboard/site-engineer", icon: FileText },
    { label: "Attendance", href: "/dashboard/site-engineer", icon: Users },
  ],
  chiefEngineer: [
    { label: "Dashboard", href: "/dashboard/chief-engineer", icon: Home },
    { label: "Projects", href: "/dashboard/chief-engineer", icon: BarChart2 },
    {
      label: "Approvals",
      href: "/dashboard/chief-engineer",
      icon: ClipboardList,
    },
    { label: "Team", href: "/dashboard/chief-engineer", icon: Users },
  ],
  materialsEngineer: [
    { label: "Dashboard", href: "/dashboard/materials-engineer", icon: Home },
    {
      label: "Inventory",
      href: "/dashboard/materials-engineer",
      icon: Package,
    },
    {
      label: "Reorder Alerts",
      href: "/dashboard/materials-engineer",
      icon: Bell,
    },
    {
      label: "Stock Updates",
      href: "/dashboard/materials-engineer",
      icon: ClipboardList,
    },
  ],
  siteOwner: [
    { label: "Dashboard", href: "/dashboard/site-owner", icon: Home },
    { label: "Projects", href: "/dashboard/site-owner", icon: BarChart2 },
    { label: "Team", href: "/dashboard/site-owner", icon: Users },
    { label: "Reports", href: "/dashboard/site-owner", icon: FileText },
    { label: "Settings", href: "/dashboard/site-owner", icon: Settings },
  ],
};

const roleBadgeColor: Record<UserRole, string> = {
  siteOwner: "#F28C2A",
  chiefEngineer: "#0B2B45",
  materialsEngineer: "#1FA6A3",
  siteEngineer: "#64748b",
};

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user ? (navByRole[user.role] ?? []) : [];
  const roleLabel = user ? roleToLabel(user.role) : "";
  const badgeColor = user ? roleBadgeColor[user.role] : "#64748b";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F4F7FA" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0B2B45" }}
      >
        <div
          className="flex items-center gap-3 px-5 h-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-[#F28C2A] flex items-center justify-center flex-shrink-0">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">
            ConstructManager Pro
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href as "/dashboard/site-engineer"}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  isActive
                    ? {
                        backgroundColor: "rgba(242,140,42,0.15)",
                        color: "#F28C2A",
                      }
                    : { color: "#93A4B5" }
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[#93A4B5] hover:text-white hover:bg-white/5"
            >
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg text-[#6B7280] hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {title && (
              <h1 className="font-bold text-[#0B2B45] text-lg">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-[#0B2B45]">
                    {user.name}
                  </span>
                  <Badge
                    className="text-[10px] px-2 py-0 rounded-full"
                    style={{
                      backgroundColor: `${badgeColor}20`,
                      color: badgeColor,
                    }}
                  >
                    {roleLabel}
                  </Badge>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#0B2B45] flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-[#6B7280] hover:text-red-500"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-1.5 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
