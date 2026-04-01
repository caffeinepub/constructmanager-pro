import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle,
  Package,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "materials" | "labour" | "admin" | "progress";
  priority: "High" | "Medium" | "Low";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "materials",
    priority: "High",
    title: "Low Stock Alert",
    message:
      "Steel Bars (TMT 12mm) stock is below reorder level: 18 tons vs 25 tons threshold.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "labour",
    priority: "Medium",
    title: "Attendance Pending Approval",
    message:
      "Labour attendance report for Nov 14 submitted by Priya Nair awaits your approval.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    type: "admin",
    priority: "High",
    title: "Passcode Changed",
    message:
      "Project Alpha passcode was updated by Chief Engineer. Please re-enter the new passcode.",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: "4",
    type: "admin",
    priority: "Low",
    title: "New Project Created",
    message:
      "Tower C project has been created and you have been assigned as a member.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "5",
    type: "materials",
    priority: "Low",
    title: "Material Delivery Confirmed",
    message:
      "GRN #GRN-042 for 200 bags of Cement (OPC 53) confirmed. Stock updated.",
    time: "2 days ago",
    read: true,
  },
];

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  materials: Package,
  labour: Users,
  admin: Building2,
  progress: CheckCircle,
};

const priorityStyle: Record<string, string> = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-500",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [filter, setFilter] = useState<
    "all" | "materials" | "labour" | "admin" | "progress"
  >("all");

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-200">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#f97316]" />
            Notifications
            {unread > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">
                {unread}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Filters */}
          <div className="px-4 py-3 border-b border-slate-100 flex gap-2 flex-wrap">
            {(["all", "labour", "materials", "progress", "admin"] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors capitalize ${
                    filter === f
                      ? "bg-[#f97316] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ),
            )}
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs px-3 py-1 rounded-full text-[#f97316] hover:underline ml-auto"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = typeIcon[n.type] ?? AlertTriangle;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#0f172a] truncate">
                          {n.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${priorityStyle[n.priority]}`}
                        >
                          {n.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {n.time}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(n.id)}
                      className="text-slate-300 hover:text-slate-500 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
