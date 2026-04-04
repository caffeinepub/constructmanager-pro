import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle,
  Package,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import {
  canisterGetNotifications,
  canisterMarkAllNotifsRead,
  canisterMarkNotifRead,
} from "../canister";

interface Notification {
  id: string;
  type: "materials" | "labour" | "admin" | "progress";
  priority: "High" | "Medium" | "Low";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

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

function mapNType(
  nType: string,
): "materials" | "labour" | "admin" | "progress" {
  if (nType === "materials" || nType === "low_stock") return "materials";
  if (nType === "labour" || nType === "payroll" || nType === "attendance")
    return "labour";
  if (nType === "progress") return "progress";
  return "admin";
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
  } catch {
    return ts;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "materials" | "labour" | "admin" | "progress"
  >("all");

  const loadNotifications = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const canisterNotifs = await canisterGetNotifications(user.email);
      const mapped: Notification[] = canisterNotifs.map((n) => ({
        id: String(Number(n.id)),
        type: mapNType(n.nType),
        priority: "Low" as const,
        title: n.nType
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        message: n.content,
        time: formatTimestamp(n.timestamp),
        read: n.isRead,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      // fallback: keep existing notifications
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (open && user?.email) {
      loadNotifications();
    }
  }, [open, user?.email, loadNotifications]);

  // Poll every 10 seconds when open
  useEffect(() => {
    if (!open || !user?.email) return;
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [open, user?.email, loadNotifications]);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);
  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    if (!user?.email) return;
    try {
      await canisterMarkAllNotifsRead(user.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // optimistic
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  async function dismiss(id: string) {
    if (!user?.email) return;
    try {
      await canisterMarkNotifRead(user.email, Number(id));
    } catch {
      /* ignore */
    }
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
                  data-ocid={`notifications.${f}.tab`}
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
                data-ocid="notifications.mark_all.button"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div
                className="p-4 space-y-3"
                data-ocid="notifications.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-slate-400"
                data-ocid="notifications.empty_state"
              >
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = typeIcon[n.type] ?? AlertTriangle;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 ${
                      n.read ? "opacity-60" : ""
                    }`}
                    data-ocid={`notifications.item.${n.id}`}
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
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
                            priorityStyle[n.priority]
                          }`}
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
                      data-ocid="notifications.close_button"
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
