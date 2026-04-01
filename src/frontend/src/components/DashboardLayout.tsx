import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  HardHat,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { type UserRole, roleToLabel, useAuth } from "../AuthContext";
import Calculator from "./Calculator";
import GroupChat from "./GroupChat";
import NotificationsPanel from "./NotificationsPanel";
import PasswordManagement from "./PasswordManagement";

interface NavItem {
  label: string;
  tab: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<UserRole, NavItem[]> = {
  chiefEngineer: [
    { label: "Overview", tab: "overview", icon: Home },
    { label: "Labour", tab: "labour", icon: Users },
    { label: "Materials", tab: "materials", icon: Package },
    { label: "Progress", tab: "progress", icon: BarChart2 },
    { label: "Notifications", tab: "notifications", icon: Bell },
    { label: "Admin Panel", tab: "admin", icon: Shield },
    { label: "Audit Log", tab: "audit", icon: BookOpen },
  ],
  siteOwner: [
    { label: "Overview", tab: "overview", icon: Home },
    { label: "Labour", tab: "labour", icon: Users },
    { label: "Materials", tab: "materials", icon: Package },
    { label: "Progress", tab: "progress", icon: BarChart2 },
    { label: "Reports", tab: "reports", icon: FileText },
    { label: "Notifications", tab: "notifications", icon: Bell },
  ],
  siteEngineer: [
    { label: "Overview", tab: "overview", icon: Home },
    { label: "Attendance", tab: "attendance", icon: Users },
    { label: "Daily Progress", tab: "progress", icon: ClipboardList },
    { label: "Notifications", tab: "notifications", icon: Bell },
  ],
  materialsEngineer: [
    { label: "Overview", tab: "overview", icon: Home },
    { label: "Inventory", tab: "inventory", icon: Package },
    { label: "Material Inward", tab: "grn", icon: ClipboardList },
    { label: "Consumption", tab: "outward", icon: FileText },
    { label: "Notifications", tab: "notifications", icon: Bell },
  ],
};

const roleBadgeColor: Record<UserRole, string> = {
  siteOwner: "#8b5cf6",
  chiefEngineer: "#f97316",
  materialsEngineer: "#10b981",
  siteEngineer: "#0ea5e9",
};

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function DashboardLayout({
  children,
  title,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) {
  const { user, activeProject, setActiveProject, logout } = useAuth();
  const navigate = useNavigate();
  const [pwOpen, setPwOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = user ? (navByRole[user.role] ?? []) : [];
  const roleLabel = user ? roleToLabel(user.role) : "";
  const badgeColor = user ? roleBadgeColor[user.role] : "#64748b";

  function handleBackToProjects() {
    setActiveProject(null);
    navigate({ to: "/projects" });
  }

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center flex-shrink-0">
          <HardHat className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-sm">
          ConstructManager <span className="text-[#f97316]">Pro</span>
        </span>
      </div>

      {/* Project context */}
      {activeProject && (
        <div className="px-3 py-3 border-b border-white/10">
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-3 h-3 text-[#f97316]" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Active Project
              </span>
            </div>
            <p className="text-white text-xs font-semibold truncate">
              {activeProject.name}
            </p>
            <button
              type="button"
              onClick={handleBackToProjects}
              className="text-[10px] text-[#f97316] hover:underline mt-0.5"
            >
              ← Switch Project
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange?.(item.tab)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: "rgba(249,115,22,0.15)",
                      color: "#f97316",
                    }
                  : { color: "#94a3b8" }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link to="/user-manual">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
            data-ocid="sidebar.user_manual.link"
          >
            <HelpCircle className="w-4 h-4 mr-2" /> User Manual
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => setPwOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Home className="w-4 h-4 mr-2" /> Home
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-white/5"
          onClick={handleLogout}
          data-ocid="sidebar.logout_button"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f1f5f9" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            {title && (
              <h1 className="font-bold text-[#0f172a] text-lg hidden sm:block">
                {title}
              </h1>
            )}
            {activeProject && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#f97316]" />
                <span className="text-sm font-medium text-slate-600 hidden sm:block">
                  {activeProject.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Help link */}
            <Link to="/user-manual">
              <button
                type="button"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#f97316] transition-colors"
                title="User Manual"
                data-ocid="topbar.user_manual.link"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </Link>

            {/* Notifications bell */}
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              data-ocid="topbar.notifications.button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Chat button */}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#f97316]"
              title="Project Chat"
              data-ocid="topbar.chat.button"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-[#0f172a]">
                  {user.name}
                </span>
                <Badge
                  className="text-[10px] px-2 py-0"
                  style={{
                    backgroundColor: `${badgeColor}20`,
                    color: badgeColor,
                  }}
                >
                  {roleLabel}
                </Badge>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-500"
              onClick={() => setPwOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-500"
              onClick={handleLogout}
              data-ocid="topbar.logout_button"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-1.5 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      <PasswordManagement open={pwOpen} onClose={() => setPwOpen(false)} />
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <GroupChat open={chatOpen} onClose={() => setChatOpen(false)} />
      <Calculator />
    </div>
  );
}
