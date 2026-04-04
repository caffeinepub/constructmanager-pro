import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart2,
  Camera,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Plus,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import { type Worker, useProjectData } from "../../ProjectDataContext";
import DashboardLayout from "../../components/DashboardLayout";
import InlineChatPanel from "../../components/InlineChatPanel";
import { exportAttendanceCSV, exportProgressCSV } from "../../utils/csvExport";
import { NATIONALITIES } from "../../utils/currency";
import { exportAttendancePDF, exportProgressPDF } from "../../utils/pdfExport";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

interface WorkerModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Worker;
  onSave: (w: Omit<Worker, "id">) => void;
}
function WorkerModal({ open, onClose, initial, onSave }: WorkerModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [skill, setSkill] = useState(initial?.skill ?? "");
  const [wage, setWage] = useState(initial?.dailyWageRate?.toString() ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [countryCode, setCountryCode] = useState("+91");
  const [status, setStatus] = useState<"Active" | "Inactive">(
    initial?.status ?? "Active",
  );

  function handleSave() {
    if (!name.trim() || !skill || !wage) {
      toast.error("Fill all required fields");
      return;
    }
    const phone = contact ? `${countryCode} ${contact}` : "";
    onSave({
      name: name.trim(),
      skill,
      dailyWageRate: Number(wage),
      contact: phone || contact,
      status,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Worker" : "Add Worker"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Worker name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Skill *</Label>
            <Select value={skill} onValueChange={setSkill}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Mason",
                  "Carpenter",
                  "Electrician",
                  "Plumber",
                  "Welder",
                  "Helper",
                  "Supervisor",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Daily Wage Rate (₹) *</Label>
            <Input
              type="number"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="e.g. 600"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <div className="flex gap-2 mt-1">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-10 w-24 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n.code + n.label} value={n.code}>
                    {n.code}
                  </option>
                ))}
              </select>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "Active" | "Inactive")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
            onClick={handleSave}
          >
            Save Worker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SiteEngineerDashboard() {
  const { user, activeProject } = useAuth();
  const {
    data,
    addWorker,
    updateWorker,
    setAttendance,
    updateProgress,
    submitPayroll,
    addAuditEntry,
  } = useProjectData();

  const [activeTab, setActiveTab] = useState("overview");
  const [workerTab, setWorkerTab] = useState("list");
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | undefined>();

  // Attendance
  const today = new Date().toISOString().split("T")[0];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Progress
  const [progressPct, setProgressPct] = useState(
    data.currentProgress.toString(),
  );
  const [progressNotes, setProgressNotes] = useState("");
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const showReminder =
    !reminderDismissed &&
    data.currentProgress === 0 &&
    data.progressHistory.length === 0;

  // Payroll
  const [payrollPeriod, setPayrollPeriod] = useState("");

  const filteredWorkers = data.workers.filter((w) =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()),
  );

  const totalLabourCost = data.workers.reduce((s, w) => {
    const days = data.attendance.filter(
      (a) => a.workerId === w.id && a.present,
    ).length;
    return s + days * w.dailyWageRate;
  }, 0);

  function getAttendance(workerId: string, date: string) {
    return (
      data.attendance.find((a) => a.workerId === workerId && a.date === date)
        ?.present ?? false
    );
  }

  function getTodayPresent() {
    return data.workers.filter((w) => getAttendance(w.id, today)).length;
  }

  function handleAddWorker(w: Omit<Worker, "id">) {
    addWorker(w);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Added Worker",
      module: "Labour",
      details: `Added ${w.name} (${w.skill})`,
    });
    toast.success(`Worker ${w.name} added!`);
  }

  function handleUpdateWorker(w: Omit<Worker, "id">) {
    if (!editWorker) return;
    updateWorker(editWorker.id, w);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Updated Worker",
      module: "Labour",
      details: `Updated ${w.name}`,
    });
    toast.success("Worker updated!");
    setEditWorker(undefined);
  }

  function handleUpdateProgress() {
    const pct = Number(progressPct);
    if (pct < 0 || pct > 100) {
      toast.error("Percentage must be 0–100");
      return;
    }
    updateProgress(pct, progressNotes, user?.name ?? "", progressPhotos);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Updated Progress",
      module: "Progress",
      details: `Progress set to ${pct}%`,
    });
    toast.success(`Progress updated to ${pct}%`);
    setProgressNotes("");
    setProgressPhotos([]);
    setReminderDismissed(true);
  }

  function handleSubmitPayroll() {
    if (!payrollPeriod.trim()) {
      toast.error("Enter period name");
      return;
    }
    submitPayroll(payrollPeriod, totalLabourCost, user?.name ?? "");
    addAuditEntry({
      user: user?.name ?? "",
      action: "Submitted Payroll",
      module: "Labour",
      details: `${payrollPeriod} payroll ${formatCurrency(totalLabourCost)} submitted`,
    });
    toast.success("Payroll submitted for approval!");
    setPayrollPeriod("");
  }

  return (
    <DashboardLayout
      title="Site Engineer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Progress Reminder */}
      {showReminder && (
        <button
          type="button"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 cursor-pointer w-full text-left"
          onClick={() => setActiveTab("progress")}
          data-ocid="se.progress.reminder"
        >
          <span className="text-lg">&#x1F4CB;</span>
          <p className="flex-1 text-sm text-amber-800 font-medium">
            Progress not updated yet — tap here to update your daily progress.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setReminderDismissed(true);
            }}
            className="text-amber-400 hover:text-amber-600"
          >
            <X className="w-4 h-4" />
          </button>
        </button>
      )}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Site Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs text-slate-500">Total Workers</span>
                </div>
                <p className="text-2xl font-bold">{data.workers.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-slate-500">Present Today</span>
                </div>
                <p className="text-2xl font-bold">{getTodayPresent()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#f97316]" />
                  <span className="text-xs text-slate-500">Completion</span>
                </div>
                <p className="text-2xl font-bold">{data.currentProgress}%</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full bg-[#f97316]"
                    style={{ width: `${data.currentProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs text-slate-500">Total Wages</span>
                </div>
                <p className="text-xl font-bold">
                  {formatCurrency(totalLabourCost)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* LABOUR/ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {["list", "attendance", "wages", "payroll"].map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={workerTab === t ? "default" : "outline"}
                  onClick={() => setWorkerTab(t)}
                  className={workerTab === t ? "bg-[#0ea5e9] text-white" : ""}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
              onClick={() =>
                exportAttendancePDF(
                  data.workers,
                  data.attendance,
                  activeProject?.name ?? "Project",
                )
              }
              data-ocid="se.attendance.upload_button"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
              onClick={() =>
                exportAttendanceCSV(
                  data.workers,
                  data.attendance,
                  activeProject?.name ?? "Project",
                )
              }
              data-ocid="se.attendance.secondary_button"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export CSV
            </Button>
          </div>

          {workerTab === "list" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search workers..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                  onClick={() => {
                    setEditWorker(undefined);
                    setWorkerModalOpen(true);
                  }}
                  data-ocid="se.worker.button"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Worker
                </Button>
              </div>
              {filteredWorkers.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="se.workers.empty_state"
                >
                  No workers yet. Add your first worker above.
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkers.map((w, i) => (
                        <TableRow
                          key={w.id}
                          data-ocid={`se.workers.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {w.name}
                          </TableCell>
                          <TableCell>{w.skill}</TableCell>
                          <TableCell>₹{w.dailyWageRate}</TableCell>
                          <TableCell className="text-slate-500">
                            {w.contact}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                w.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }
                            >
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditWorker(w);
                                setWorkerModalOpen(true);
                              }}
                              data-ocid={`se.workers.edit_button.${i + 1}`}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          )}

          {workerTab === "attendance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mark Daily Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {data.workers.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No workers added yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr>
                          <th className="text-left py-1 pr-4">Worker</th>
                          {last7.map((d) => (
                            <th key={d} className="px-2 py-1 text-center">
                              {d.slice(5)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.workers.map((w) => (
                          <tr key={w.id} className="border-t border-slate-100">
                            <td className="pr-4 py-2 font-medium">{w.name}</td>
                            {last7.map((d) => {
                              const present = getAttendance(w.id, d);
                              return (
                                <td key={d} className="px-2 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendance(w.id, d, !present)
                                    }
                                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                                      present
                                        ? "bg-green-500 text-white"
                                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    }`}
                                  >
                                    {present ? "P" : "A"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {workerTab === "wages" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Wage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {data.workers.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No workers added yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.workers.map((w) => {
                        const days = data.attendance.filter(
                          (a) => a.workerId === w.id && a.present,
                        ).length;
                        return (
                          <TableRow key={w.id}>
                            <TableCell className="font-medium">
                              {w.name}
                            </TableCell>
                            <TableCell>{w.skill}</TableCell>
                            <TableCell>{days}</TableCell>
                            <TableCell>₹{w.dailyWageRate}</TableCell>
                            <TableCell className="font-semibold text-[#0ea5e9]">
                              ₹{days * w.dailyWageRate}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold bg-slate-50">
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell className="text-[#0ea5e9]">
                          {formatCurrency(totalLabourCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {workerTab === "payroll" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Submit Payroll for Approval
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Period Name</Label>
                    <Input
                      value={payrollPeriod}
                      onChange={(e) => setPayrollPeriod(e.target.value)}
                      placeholder="e.g. Week 3 (Dec 2024)"
                      className="mt-1"
                    />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold text-[#0ea5e9]">
                      {formatCurrency(totalLabourCost)}
                    </p>
                  </div>
                  <Button
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                    onClick={handleSubmitPayroll}
                    data-ocid="se.payroll.submit_button"
                  >
                    Submit for Approval
                  </Button>
                </CardContent>
              </Card>
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0f172a] text-sm">
                  Submission History
                </h3>
                {data.payroll.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.period}</p>
                        <p className="text-sm text-slate-500">
                          {p.submittedAt}
                        </p>
                        <p className="text-[#0ea5e9] font-bold">
                          {formatCurrency(p.totalAmount)}
                        </p>
                      </div>
                      <Badge
                        className={
                          p.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : p.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {p.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
              onClick={() =>
                exportProgressPDF(
                  data.progressHistory,
                  activeProject?.name ?? "Project",
                  data.currentProgress,
                )
              }
              data-ocid="se.progress.upload_button"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export Progress PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
              onClick={() =>
                exportProgressCSV(
                  data.progressHistory,
                  activeProject?.name ?? "Project",
                  data.currentProgress,
                )
              }
              data-ocid="se.progress.secondary_button"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export CSV
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border p-8 min-w-[180px]">
              <div className="relative w-32 h-32">
                <svg
                  viewBox="0 0 36 36"
                  className="w-32 h-32 -rotate-90"
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
                    strokeDasharray={`${data.currentProgress} ${
                      100 - data.currentProgress
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0f172a]">
                    {data.currentProgress}%
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                Project Completion
              </p>
            </div>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-sm">Update Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Completion % (0–100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={progressPct}
                    onChange={(e) => setProgressPct(e.target.value)}
                    className="mt-1"
                    data-ocid="se.progress.input"
                  />
                </div>
                <div>
                  <Label>Notes / Observations</Label>
                  <Textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                    placeholder="What was completed today?"
                    data-ocid="se.progress.textarea"
                  />
                </div>
                <div>
                  <Label>Site Photos (optional)</Label>
                  <div className="mt-1 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-[#0ea5e9] transition-colors">
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        Attach site photos
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          Promise.all(
                            files.map(
                              (f) =>
                                new Promise<string>((res) => {
                                  const reader = new FileReader();
                                  reader.onload = () =>
                                    res(reader.result as string);
                                  reader.readAsDataURL(f);
                                }),
                            ),
                          ).then((urls) =>
                            setProgressPhotos((prev) => [...prev, ...urls]),
                          );
                        }}
                        data-ocid="se.progress.photo_input"
                      />
                    </label>
                    {progressPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {progressPhotos.map((src, i) => (
                          <div key={src.slice(-20)} className="relative group">
                            <img
                              src={src}
                              alt="Construction site view"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setProgressPhotos((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                  onClick={handleUpdateProgress}
                  data-ocid="se.progress.submit_button"
                >
                  Update Progress
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress History</CardTitle>
            </CardHeader>
            <CardContent>
              {data.progressHistory.length === 0 ? (
                <p
                  className="text-slate-400 text-sm"
                  data-ocid="se.progress.empty_state"
                >
                  No updates yet. Submit the first progress entry above.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data.progressHistory].reverse().map((p, i) => (
                      <React.Fragment key={p.id}>
                        <TableRow data-ocid={`se.progress.item.${i + 1}`}>
                          <TableCell>{p.date}</TableCell>
                          <TableCell>
                            <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9]">
                              {p.percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 max-w-xs">
                            {p.notes}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {p.by}
                          </TableCell>
                        </TableRow>
                        {p.photos && p.photos.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="pt-0 pb-3">
                              <div className="flex flex-wrap gap-2 mt-1">
                                {p.photos.map((src) => (
                                  <a
                                    key={src.slice(-16)}
                                    href={src}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img
                                      src={src}
                                      alt="Construction site view"
                                      className="w-20 h-20 object-cover rounded-lg border hover:scale-105 transition-transform cursor-pointer"
                                    />
                                  </a>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Notifications</h2>
          <div className="space-y-3">
            {data.payroll
              .filter((p) => p.status === "approved")
              .map((p) => (
                <Card key={p.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-green-600 text-lg">&#x2714;</span>
                    <div>
                      <p className="font-semibold text-green-800">
                        Payroll Approved
                      </p>
                      <p className="text-sm text-green-600">
                        {p.period} — ₹{p.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {data.payroll
              .filter((p) => p.status === "pending")
              .map((p) => (
                <Card key={p.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-yellow-600 text-lg">&#x23F3;</span>
                    <div>
                      <p className="font-semibold text-yellow-800">
                        Payroll Pending Approval
                      </p>
                      <p className="text-sm text-yellow-600">
                        {p.period} — ₹{p.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {data.payroll.length === 0 && (
              <div
                className="text-center py-8 text-slate-400"
                data-ocid="se.notifications.empty_state"
              >
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT */}
      {activeTab === "chat" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0f172a]">
              Project Group Chat
            </h2>
          </div>
          <InlineChatPanel />
        </div>
      )}

      <WorkerModal
        open={workerModalOpen}
        onClose={() => {
          setWorkerModalOpen(false);
          setEditWorker(undefined);
        }}
        initial={editWorker}
        onSave={editWorker ? handleUpdateWorker : handleAddWorker}
      />
    </DashboardLayout>
  );
}
