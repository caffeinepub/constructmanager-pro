import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import type { Task } from "../../backend";
import DashboardLayout from "../../components/DashboardLayout";
import { useActor } from "../../hooks/useActor";

const mockTasks: Task[] = [
  {
    title: "Inspect foundation concrete pouring",
    status: "In Progress",
    description: "Verify concrete mix ratio and pouring process at Section A",
    assignedTo: {} as Task["assignedTo"],
  },
  {
    title: "Labour attendance verification",
    status: "To Do",
    description: "Verify GPS check-ins for all workers on Site B",
    assignedTo: {} as Task["assignedTo"],
  },
  {
    title: "Material request for steel rods",
    status: "Done",
    description: "Submit requisition for 200 steel rods for next week",
    assignedTo: {} as Task["assignedTo"],
  },
  {
    title: "Daily progress report submission",
    status: "To Do",
    description: "Fill and submit daily progress report for Block C",
    assignedTo: {} as Task["assignedTo"],
  },
];

const statusConfig: Record<
  string,
  {
    color: string;
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  "To Do": { color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: AlertCircle },
  "In Progress": { color: "#F28C2A", bg: "rgba(242,140,42,0.1)", icon: Clock },
  Done: { color: "#1FA6A3", bg: "rgba(31,166,163,0.1)", icon: CheckCircle },
};

export default function SiteEngineerDashboard() {
  const { user } = useAuth();
  const { actor, isFetching } = useActor();
  const [logDate, setLogDate] = useState("");
  const [logContent, setLogContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: tasks = mockTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return mockTasks;
      try {
        // Principal is needed — use mock data as fallback
        return mockTasks;
      } catch {
        return mockTasks;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const todo = tasks.filter((t) => t.status === "To Do").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const done = tasks.filter((t) => t.status === "Done").length;

  async function handleSubmitLog(e: React.FormEvent) {
    e.preventDefault();
    if (!logDate || !logContent) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    setSubmitting(true);
    try {
      const dateTimestamp = BigInt(new Date(logDate).getTime());
      await actor.submitDailyLog(dateTimestamp, logContent);
      toast.success("Daily log submitted successfully!");
      setLogDate("");
      setLogContent("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit log.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Site Engineer Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold text-[#0B2B45]">
            Welcome back, {user?.name ?? "Engineer"} 👷
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Here's your task overview for today.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "To Do",
              count: todo,
              color: "#64748b",
              icon: AlertCircle,
            },
            {
              label: "In Progress",
              count: inProgress,
              color: "#F28C2A",
              icon: Clock,
            },
            { label: "Done", count: done, color: "#1FA6A3", icon: CheckCircle },
          ].map((stat, i) => (
            <Card
              key={stat.label}
              className="card-shadow border-border"
              data-ocid={`tasks.card.${i + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className="text-3xl font-bold mt-1"
                      style={{ color: stat.color }}
                    >
                      {stat.count}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tasks table */}
        <Card className="card-shadow border-border" data-ocid="tasks.table">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45] flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Task
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Description
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, i) => {
                  const cfg =
                    statusConfig[task.status] ?? statusConfig["To Do"];
                  return (
                    <TableRow
                      key={task.title}
                      data-ocid={`tasks.item.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm text-[#0B2B45]">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280] max-w-xs truncate">
                        {task.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submit Daily Log */}
        <Card className="card-shadow border-border" data-ocid="daily_log.panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45]">
              Submit Daily Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-date" className="text-sm text-[#6B7280]">
                  Date
                </Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="max-w-xs"
                  data-ocid="daily_log.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-content" className="text-sm text-[#6B7280]">
                  Log Entry
                </Label>
                <Textarea
                  id="log-content"
                  placeholder="Describe the day's progress, issues, and observations..."
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={4}
                  data-ocid="daily_log.textarea"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
                data-ocid="daily_log.submit_button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Log"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
