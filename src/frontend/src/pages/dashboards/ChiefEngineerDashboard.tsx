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
  AlertTriangle,
  Camera,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Package,
  Plus,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import {
  type Material,
  type Worker,
  useProjectData,
} from "../../ProjectDataContext";
import DashboardLayout from "../../components/DashboardLayout";
import InlineChatPanel from "../../components/InlineChatPanel";
import {
  exportAttendanceCSV,
  exportMaterialsCSV,
  exportProgressCSV,
} from "../../utils/csvExport";
import {
  exportAttendancePDF,
  exportMaterialsPDF,
  exportProgressPDF,
} from "../../utils/pdfExport";

// ---- Helpers ----
function getMaterialStatus(m: Material): "OK" | "Low" | "Critical" {
  if (m.currentStock <= m.reorderLevel * 0.5) return "Critical";
  if (m.currentStock <= m.reorderLevel) return "Low";
  return "OK";
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---- Worker Modal ----
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
  const [status, setStatus] = useState<"Active" | "Inactive">(
    initial?.status ?? "Active",
  );

  function handleSave() {
    if (!name.trim() || !skill || !wage) {
      toast.error("Fill all required fields");
      return;
    }
    onSave({
      name: name.trim(),
      skill,
      dailyWageRate: Number(wage),
      contact: contact.trim(),
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
            <Label>Contact</Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone number"
              className="mt-1"
            />
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
            className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
            onClick={handleSave}
          >
            Save Worker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Material Modal ----
interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Material;
  onSave: (m: Omit<Material, "id">) => void;
}
function MaterialModal({ open, onClose, initial, onSave }: MaterialModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [stock, setStock] = useState(initial?.currentStock?.toString() ?? "");
  const [reorder, setReorder] = useState(
    initial?.reorderLevel?.toString() ?? "",
  );
  const [price, setPrice] = useState(initial?.unitPrice?.toString() ?? "");
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");

  function handleSave() {
    if (!name.trim() || !unit) {
      toast.error("Name and unit required");
      return;
    }
    onSave({
      name: name.trim(),
      unit,
      currentStock: Number(stock),
      reorderLevel: Number(reorder),
      unitPrice: Number(price),
      supplier: supplier.trim(),
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Material" : "Add Material"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Material Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cement (OPC 53)"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Unit *</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {["bags", "tons", "cubic meters", "liters", "pieces", "kg"].map(
                  (u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Current Stock</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                value={reorder}
                onChange={(e) => setReorder(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Unit Price (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier name"
              className="mt-1"
            />
          </div>
          <Button
            className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
            onClick={handleSave}
          >
            Save Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChiefEngineerDashboard() {
  const {
    user,
    activeProject,
    updateProjectCredentials,
    updateProjectInfo,
    addMemberToProject,
    removeMemberFromProject,
  } = useAuth();
  const {
    data,
    addWorker,
    updateWorker,
    setAttendance,
    addMaterial,
    updateMaterial,
    recordInward,
    recordOutward,
    updateProgress,
    reviewPayroll,
    setBudget,
    addAuditEntry,
  } = useProjectData();

  const [activeTab, setActiveTab] = useState("overview");

  // Worker state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | undefined>();
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerTab, setWorkerTab] = useState("list");

  // Attendance
  const today = new Date().toISOString().split("T")[0];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Material state
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | undefined>();
  const [matSearch, setMatSearch] = useState("");
  const [matTab, setMatTab] = useState("inventory");
  const [inwardMat, setInwardMat] = useState("");
  const [inwardQty, setInwardQty] = useState("");
  const [inwardDate, setInwardDate] = useState(today);
  const [inwardSupplier, setInwardSupplier] = useState("");
  const [inwardNotes, setInwardNotes] = useState("");
  const [outwardMat, setOutwardMat] = useState("");
  const [outwardQty, setOutwardQty] = useState("");
  const [outwardDate, setOutwardDate] = useState(today);
  const [outwardArea, setOutwardArea] = useState("");
  const [outwardNotes, setOutwardNotes] = useState("");

  // Progress state
  const [progressPct, setProgressPct] = useState(
    data.currentProgress.toString(),
  );
  const [progressNotes, setProgressNotes] = useState("");
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);

  // Admin state
  const [adminTab, setAdminTab] = useState("settings");
  const [newProjectName, setNewProjectName] = useState(
    activeProject?.name ?? "",
  );
  const [newLocation, setNewLocation] = useState(activeProject?.location ?? "");
  const [newTeamCode, setNewTeamCode] = useState("");
  const [newTeamPw, setNewTeamPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [budgetInput, setBudgetInput] = useState(data.budget.toString());
  const [auditFilter, setAuditFilter] = useState("All");
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("siteEngineer");

  // Computed
  const totalMaterialValue = data.materials.reduce(
    (s, m) => s + m.currentStock * m.unitPrice,
    0,
  );
  const totalLabourCost = data.workers.reduce((s, w) => {
    const presentDays = data.attendance.filter(
      (a) => a.workerId === w.id && a.present,
    ).length;
    return s + presentDays * w.dailyWageRate;
  }, 0);
  const alertCount = data.materials.filter(
    (m) => getMaterialStatus(m) !== "OK",
  ).length;
  const filteredMaterials = data.materials.filter((m) =>
    m.name.toLowerCase().includes(matSearch.toLowerCase()),
  );
  const filteredWorkers = data.workers.filter((w) =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()),
  );

  function getAttendance(workerId: string, date: string) {
    return (
      data.attendance.find((a) => a.workerId === workerId && a.date === date)
        ?.present ?? false
    );
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

  function handleAddMaterial(m: Omit<Material, "id">) {
    addMaterial(m);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Added Material",
      module: "Materials",
      details: `Added ${m.name} - ${m.currentStock} ${m.unit}`,
    });
    toast.success(`Material ${m.name} added!`);
  }

  function handleUpdateMaterial(m: Omit<Material, "id">) {
    if (!editMaterial) return;
    updateMaterial(editMaterial.id, m);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Updated Material",
      module: "Materials",
      details: `Updated ${m.name}`,
    });
    toast.success("Material updated!");
    setEditMaterial(undefined);
  }

  function handleRecordInward() {
    if (!inwardMat || !inwardQty) {
      toast.error("Select material and quantity");
      return;
    }
    recordInward({
      materialId: inwardMat,
      quantity: Number(inwardQty),
      date: inwardDate,
      notes: inwardNotes,
      supplier: inwardSupplier,
      by: user?.name ?? "",
    });
    addAuditEntry({
      user: user?.name ?? "",
      action: "Material Inward",
      module: "Materials",
      details: `${Number(inwardQty)} units received`,
    });
    toast.success("Stock updated!");
    setInwardQty("");
    setInwardNotes("");
    setInwardSupplier("");
  }

  function handleRecordOutward() {
    if (!outwardMat || !outwardQty) {
      toast.error("Select material and quantity");
      return;
    }
    recordOutward({
      materialId: outwardMat,
      quantity: Number(outwardQty),
      date: outwardDate,
      notes: outwardNotes,
      workArea: outwardArea,
      by: user?.name ?? "",
    });
    addAuditEntry({
      user: user?.name ?? "",
      action: "Material Outward",
      module: "Materials",
      details: `${Number(outwardQty)} units issued to ${outwardArea}`,
    });
    toast.success("Consumption recorded!");
    setOutwardQty("");
    setOutwardNotes("");
    setOutwardArea("");
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
  }

  function handleApprovePayroll(id: string) {
    reviewPayroll(id, "approved", user?.name ?? "");
    addAuditEntry({
      user: user?.name ?? "",
      action: "Approved Payroll",
      module: "Labour",
      details: "Payroll approved",
    });
    toast.success("Payroll approved!");
  }

  function handleRejectPayroll(id: string) {
    reviewPayroll(id, "rejected", user?.name ?? "");
    toast.success("Payroll rejected.");
  }

  function handleSaveSettings() {
    if (!activeProject) return;
    updateProjectInfo(activeProject.id, newProjectName, newLocation);
    addAuditEntry({
      user: user?.name ?? "",
      action: "Updated Project Settings",
      module: "Admin",
      details: `Name: ${newProjectName}`,
    });
    toast.success("Settings saved!");
  }

  function handleChangeCredentials() {
    if (!activeProject || !newTeamCode || !newTeamPw) {
      toast.error("Both Team Code and Team Password required");
      return;
    }
    updateProjectCredentials(
      activeProject.id,
      newTeamCode.toUpperCase(),
      newTeamPw,
    );
    addAuditEntry({
      user: user?.name ?? "",
      action: "Changed Team Credentials",
      module: "Admin",
      details: "Team Code and Password updated",
    });
    toast.success("Credentials updated! All sessions invalidated.");
    setNewTeamCode("");
    setNewTeamPw("");
  }

  function handleSetBudget() {
    setBudget(Number(budgetInput));
    addAuditEntry({
      user: user?.name ?? "",
      action: "Set Budget",
      module: "Admin",
      details: `Budget set to ${formatCurrency(Number(budgetInput))}`,
    });
    toast.success("Budget saved!");
  }

  function handleAddMember() {
    if (!activeProject || !addMemberEmail.trim()) {
      toast.error("Email required");
      return;
    }
    addMemberToProject(activeProject.id, {
      email: addMemberEmail.trim().toLowerCase(),
      name: addMemberEmail.split("@")[0],
      role: addMemberRole as
        | "siteEngineer"
        | "materialsEngineer"
        | "siteOwner"
        | "chiefEngineer",
    });
    addAuditEntry({
      user: user?.name ?? "",
      action: "Added Member",
      module: "Admin",
      details: `Added ${addMemberEmail} as ${addMemberRole}`,
    });
    toast.success("Member added!");
    setAddMemberEmail("");
  }

  const filteredAudit =
    auditFilter === "All"
      ? data.auditLog
      : data.auditLog.filter((e) => e.module === auditFilter);

  return (
    <DashboardLayout
      title="Chief Engineer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Project Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs text-slate-500">Total Workers</span>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">
                  {data.workers.length}
                </p>
                <p className="text-xs text-slate-400">
                  {data.workers.filter((w) => w.status === "Active").length}{" "}
                  active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs text-slate-500">
                    Materials Value
                  </span>
                </div>
                <p className="text-xl font-bold text-[#0f172a]">
                  {formatCurrency(totalMaterialValue)}
                </p>
                <p className="text-xs text-slate-400">{alertCount} alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#f97316]" />
                  <span className="text-xs text-slate-500">Completion</span>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">
                  {data.currentProgress}%
                </p>
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
                  <Shield className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs text-slate-500">Labour Cost</span>
                </div>
                <p className="text-xl font-bold text-[#0f172a]">
                  {formatCurrency(totalLabourCost)}
                </p>
                <p className="text-xs text-slate-400">Total wages paid</p>
              </CardContent>
            </Card>
          </div>
          {data.budget > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-[#0f172a]">
                    Budget Usage
                  </span>
                  <span className="text-sm text-slate-500">
                    {formatCurrency(totalLabourCost + totalMaterialValue)} /{" "}
                    {formatCurrency(data.budget)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#f97316]"
                    style={{
                      width: `${Math.min(100, ((totalLabourCost + totalMaterialValue) / data.budget) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round(
                    ((totalLabourCost + totalMaterialValue) / data.budget) *
                      100,
                  )}
                  % of budget used
                </p>
              </CardContent>
            </Card>
          )}
          {alertCount > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Material Alerts ({alertCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.materials
                  .filter((m) => getMaterialStatus(m) !== "OK")
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-orange-800">
                        {m.name}
                      </span>
                      <Badge
                        className={
                          getMaterialStatus(m) === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {getMaterialStatus(m)}: {m.currentStock} {m.unit}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* LABOUR */}
      {activeTab === "labour" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["list", "attendance", "wages", "payroll"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={workerTab === t ? "default" : "outline"}
                onClick={() => setWorkerTab(t)}
                className={workerTab === t ? "bg-[#f97316] text-white" : ""}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#f97316] text-[#f97316] hover:bg-orange-50"
                onClick={() =>
                  exportAttendancePDF(
                    data.workers,
                    data.attendance,
                    activeProject?.name ?? "Project",
                  )
                }
                data-ocid="ce.labour.upload_button"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#f97316] text-[#f97316] hover:bg-orange-50"
                onClick={() =>
                  exportAttendanceCSV(
                    data.workers,
                    data.attendance,
                    activeProject?.name ?? "Project",
                  )
                }
                data-ocid="ce.labour.secondary_button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export CSV
              </Button>
            </div>
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
                  className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={() => {
                    setEditWorker(undefined);
                    setWorkerModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Worker
                </Button>
              </div>
              {filteredWorkers.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="labour.empty_state"
                >
                  No workers yet. Add the first worker.
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Daily Rate</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkers.map((w, i) => (
                        <TableRow key={w.id} data-ocid={`labour.item.${i + 1}`}>
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
                <CardTitle className="text-sm">
                  Attendance — Last 7 Days
                </CardTitle>
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
                                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${present ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
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
                        <TableHead>Days Present</TableHead>
                        <TableHead>Daily Rate</TableHead>
                        <TableHead>Total Wages</TableHead>
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
                            <TableCell className="font-semibold text-[#f97316]">
                              ₹{days * w.dailyWageRate}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold bg-slate-50">
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell className="text-[#f97316]">
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
            <div className="space-y-3">
              <h3 className="font-semibold text-[#0f172a]">
                Payroll Approvals
              </h3>
              {data.payroll.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No payroll submissions yet.
                </p>
              ) : (
                data.payroll.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-[#0f172a]">
                            {p.period}
                          </p>
                          <p className="text-sm text-slate-500">
                            Submitted by {p.submittedBy} on {p.submittedAt}
                          </p>
                          <p className="text-lg font-bold text-[#f97316] mt-1">
                            {formatCurrency(p.totalAmount)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
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
                          {p.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleApprovePayroll(p.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-500"
                                onClick={() => handleRejectPayroll(p.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["inventory", "inward", "outward", "alerts"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={matTab === t ? "default" : "outline"}
                onClick={() => setMatTab(t)}
                className={matTab === t ? "bg-[#10b981] text-white" : ""}
              >
                {t === "alerts"
                  ? `Alerts${alertCount > 0 ? ` (${alertCount})` : ""}`
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#10b981] text-[#10b981] hover:bg-emerald-50"
                onClick={() =>
                  exportMaterialsPDF(
                    data.materials,
                    activeProject?.name ?? "Project",
                  )
                }
                data-ocid="ce.materials.upload_button"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#10b981] text-[#10b981] hover:bg-emerald-50"
                onClick={() =>
                  exportMaterialsCSV(
                    data.materials,
                    activeProject?.name ?? "Project",
                  )
                }
                data-ocid="ce.materials.secondary_button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          {matTab === "inventory" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search materials..."
                  value={matSearch}
                  onChange={(e) => setMatSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={() => {
                    setEditMaterial(undefined);
                    setMatModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Material
                </Button>
              </div>
              {filteredMaterials.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="materials.empty_state"
                >
                  No materials yet. Add the first material.
                </div>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name (A–Z)</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Reorder</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMaterials.map((m, i) => {
                          const st = getMaterialStatus(m);
                          return (
                            <TableRow
                              key={m.id}
                              data-ocid={`materials.item.${i + 1}`}
                            >
                              <TableCell className="font-medium">
                                {m.name}
                              </TableCell>
                              <TableCell>{m.unit}</TableCell>
                              <TableCell>{m.currentStock}</TableCell>
                              <TableCell>{m.reorderLevel}</TableCell>
                              <TableCell>₹{m.unitPrice}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(m.currentStock * m.unitPrice)}
                              </TableCell>
                              <TableCell className="text-slate-500">
                                {m.supplier}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    st === "OK"
                                      ? "bg-green-100 text-green-700"
                                      : st === "Low"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }
                                >
                                  {st}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditMaterial(m);
                                    setMatModalOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {matTab === "inward" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Record Material Inward (GRN)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Material *</Label>
                  <Select value={inwardMat} onValueChange={setInwardMat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={inwardQty}
                      onChange={(e) => setInwardQty(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={inwardDate}
                      onChange={(e) => setInwardDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={inwardSupplier}
                    onChange={(e) => setInwardSupplier(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={inwardNotes}
                    onChange={(e) => setInwardNotes(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <Button
                  className="bg-[#10b981] hover:bg-[#059669] text-white"
                  onClick={handleRecordInward}
                >
                  Record Inward
                </Button>
              </CardContent>
            </Card>
          )}

          {matTab === "outward" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Record Material Issue (Outward)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Material *</Label>
                  <Select value={outwardMat} onValueChange={setOutwardMat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={outwardQty}
                      onChange={(e) => setOutwardQty(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={outwardDate}
                      onChange={(e) => setOutwardDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Work Area</Label>
                  <Input
                    value={outwardArea}
                    onChange={(e) => setOutwardArea(e.target.value)}
                    className="mt-1"
                    placeholder="e.g. Floor 2"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={outwardNotes}
                    onChange={(e) => setOutwardNotes(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <Button
                  className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleRecordOutward}
                >
                  Record Issue
                </Button>
              </CardContent>
            </Card>
          )}

          {matTab === "alerts" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[#0f172a]">Low Stock Alerts</h3>
              {data.materials.filter((m) => getMaterialStatus(m) !== "OK")
                .length === 0 ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">
                    All materials are adequately stocked.
                  </span>
                </div>
              ) : (
                data.materials
                  .filter((m) => getMaterialStatus(m) !== "OK")
                  .map((m) => {
                    const st = getMaterialStatus(m);
                    return (
                      <Card
                        key={m.id}
                        className={
                          st === "Critical"
                            ? "border-red-200 bg-red-50"
                            : "border-yellow-200 bg-yellow-50"
                        }
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{m.name}</p>
                            <p className="text-sm text-slate-500">
                              Stock: {m.currentStock} {m.unit} | Reorder level:{" "}
                              {m.reorderLevel} {m.unit}
                            </p>
                            <p className="text-xs text-slate-400">
                              Supplier: {m.supplier}
                            </p>
                          </div>
                          <Badge
                            className={
                              st === "Critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {st}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })
              )}
            </div>
          )}
        </div>
      )}

      {/* PROGRESS */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              className="border-[#f97316] text-[#f97316] hover:bg-orange-50"
              onClick={() =>
                exportProgressPDF(
                  data.progressHistory,
                  activeProject?.name ?? "Project",
                  data.currentProgress,
                )
              }
              data-ocid="ce.progress.upload_button"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#f97316] text-[#f97316] hover:bg-orange-50"
              onClick={() =>
                exportProgressCSV(
                  data.progressHistory,
                  activeProject?.name ?? "Project",
                  data.currentProgress,
                )
              }
              data-ocid="ce.progress.secondary_button"
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
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeDasharray={`${data.currentProgress} ${100 - data.currentProgress}`}
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
                <CardTitle className="text-sm">
                  Update Progress (CE Override)
                </CardTitle>
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
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                    placeholder="Update notes..."
                  />
                </div>
                <div>
                  <Label>Site Photos (optional)</Label>
                  <div className="mt-1 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-[#f97316] transition-colors">
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
                  className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={handleUpdateProgress}
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
                <p className="text-slate-400 text-sm">
                  No progress updates yet.
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
                    {[...data.progressHistory].reverse().map((p) => (
                      <React.Fragment key={p.id}>
                        <TableRow>
                          <TableCell>{p.date}</TableCell>
                          <TableCell>
                            <Badge className="bg-[#f97316]/10 text-[#f97316]">
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
                          <TableRow key={`${p.id}-ph`}>
                            <TableCell colSpan={4} className="pt-0 pb-3">
                              <div className="flex flex-wrap gap-2">
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

      {/* ADMIN PANEL */}
      {activeTab === "admin" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["settings", "credentials", "users", "budget"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={adminTab === t ? "default" : "outline"}
                onClick={() => setAdminTab(t)}
                className={
                  adminTab === t ? "bg-[#f97316] text-white" : "text-gray-600"
                }
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          {adminTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  className="bg-[#1a1a1a] hover:bg-gray-800 text-white"
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {adminTab === "credentials" && (
            <div className="space-y-4">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-amber-700 mb-2">
                    ⚠️ Current Credentials
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Team Code:</span>{" "}
                    <strong className="font-mono">
                      {activeProject?.teamCode}
                    </strong>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-slate-500">Team Password:</span>{" "}
                    <strong className="font-mono">
                      {activeProject?.teamPassword}
                    </strong>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Change Team Code &amp; Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    ⚠️ Changing credentials will invalidate all active sessions.
                    Team members will need to re-enter the new Team Code.
                  </p>
                  <div>
                    <Label>New Team Code (Join Code)</Label>
                    <Input
                      value={newTeamCode}
                      onChange={(e) =>
                        setNewTeamCode(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. SITE99"
                      className="mt-1 uppercase font-mono"
                      data-ocid="admin.credentials.input"
                    />
                  </div>
                  <div>
                    <Label>New Team Password (Access Password)</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newTeamPw}
                        onChange={(e) => setNewTeamPw(e.target.value)}
                        placeholder="Strong password"
                        className="pr-10"
                        data-ocid="admin.credentials.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showNewPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleChangeCredentials}
                  >
                    Update Credentials
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {adminTab === "users" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activeProject?.members ?? []).map((m, i) => (
                        <TableRow
                          key={m.email}
                          data-ocid={`admin.users.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {m.name}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {m.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                backgroundColor: "#f97316",
                                color: "white",
                                fontSize: "10px",
                              }}
                            >
                              {m.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {m.email !== user?.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-500 hover:bg-red-50"
                                onClick={() => {
                                  if (activeProject)
                                    removeMemberFromProject(
                                      activeProject.id,
                                      m.email,
                                    );
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={addMemberEmail}
                      onChange={(e) => setAddMemberEmail(e.target.value)}
                      placeholder="member@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={addMemberRole}
                      onValueChange={setAddMemberRole}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chiefEngineer">
                          Chief Engineer
                        </SelectItem>
                        <SelectItem value="siteEngineer">
                          Site Engineer
                        </SelectItem>
                        <SelectItem value="materialsEngineer">
                          Materials Engineer
                        </SelectItem>
                        <SelectItem value="siteOwner">Site Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="bg-[#1a1a1a] hover:bg-gray-800 text-white"
                    onClick={handleAddMember}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {adminTab === "budget" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Total Budget (₹)</Label>
                  <Input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  className="bg-[#1a1a1a] hover:bg-gray-800 text-white"
                  onClick={handleSetBudget}
                >
                  Save Budget
                </Button>
                {data.budget > 0 && (
                  <div className="mt-4">
                    <p className="text-sm">
                      <span className="text-slate-500">Budget: </span>
                      <strong>{formatCurrency(data.budget)}</strong>
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Spent: </span>
                      <strong>
                        {formatCurrency(totalLabourCost + totalMaterialValue)}
                      </strong>
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">Remaining: </span>
                      <strong
                        className={
                          totalLabourCost + totalMaterialValue > data.budget
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {formatCurrency(
                          data.budget - totalLabourCost - totalMaterialValue,
                        )}
                      </strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["All", "Labour", "Materials", "Progress", "Admin"].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={auditFilter === f ? "default" : "outline"}
                onClick={() => setAuditFilter(f)}
                className={
                  auditFilter === f
                    ? "bg-[#f97316] text-white"
                    : "text-gray-600"
                }
              >
                {f}
              </Button>
            ))}
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudit.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-400 py-8"
                    >
                      No audit entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAudit.map((e, i) => (
                    <TableRow key={e.id} data-ocid={`audit.item.${i + 1}`}>
                      <TableCell className="text-xs text-slate-500">
                        {e.timestamp}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {e.user}
                      </TableCell>
                      <TableCell className="text-sm">{e.action}</TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-600 text-xs">
                          {e.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {e.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
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

      {/* Worker Modal */}
      <WorkerModal
        open={workerModalOpen}
        onClose={() => {
          setWorkerModalOpen(false);
          setEditWorker(undefined);
        }}
        initial={editWorker}
        onSave={editWorker ? handleUpdateWorker : handleAddWorker}
      />

      {/* Material Modal */}
      <MaterialModal
        open={matModalOpen}
        onClose={() => {
          setMatModalOpen(false);
          setEditMaterial(undefined);
        }}
        initial={editMaterial}
        onSave={editMaterial ? handleUpdateMaterial : handleAddMaterial}
      />
    </DashboardLayout>
  );
}
