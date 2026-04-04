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
  CheckCircle,
  Download,
  FileSpreadsheet,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import { type Material, useProjectData } from "../../ProjectDataContext";
import DashboardLayout from "../../components/DashboardLayout";
import InlineChatPanel from "../../components/InlineChatPanel";
import { MASTER_MATERIALS } from "../../data/masterMaterials";
import { exportMaterialsCSV } from "../../utils/csvExport";
import { convertFromUSD } from "../../utils/currency";
import { exportMaterialsPDF } from "../../utils/pdfExport";

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

interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Material;
  onSave: (m: Omit<Material, "id">) => void;
}
function MaterialModal({ open, onClose, initial, onSave }: MaterialModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [suggestions, setSuggestions] = useState<typeof MASTER_MATERIALS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
          <div className="relative">
            <Label>Material Name *</Label>
            <Input
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (val.length >= 1) {
                  const matches = MASTER_MATERIALS.filter((m) =>
                    m.name.toLowerCase().includes(val.toLowerCase()),
                  ).slice(0, 8);
                  setSuggestions(matches);
                  setShowSuggestions(matches.length > 0);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type to search materials..."
              className="mt-1"
              data-ocid="me.material.input"
            />
            {showSuggestions && (
              <div className="absolute z-50 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                {suggestions.map((m) => {
                  const displayPrice = convertFromUSD(
                    m.usdPrice,
                    user?.currency ?? "INR (₹)",
                  );
                  return (
                    <button
                      key={m.name}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm border-b border-slate-100 last:border-0"
                      onClick={() => {
                        setName(m.name);
                        setUnit(m.unit);
                        setPrice(String(displayPrice));
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium text-slate-800">
                        {m.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({m.unit})
                      </span>
                      <span className="text-xs text-[#f97316] ml-2 float-right">
                        ₹{displayPrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            onClick={handleSave}
          >
            Save Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MaterialsEngineerDashboard() {
  const { user, activeProject } = useAuth();
  const {
    data,
    addMaterial,
    updateMaterial,
    recordInward,
    recordOutward,
    addAuditEntry,
  } = useProjectData();

  const [activeTab, setActiveTab] = useState("overview");
  const [matSearch, setMatSearch] = useState("");
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | undefined>();

  const today = new Date().toISOString().split("T")[0];

  // Inward
  const [inwardMat, setInwardMat] = useState("");
  const [inwardQty, setInwardQty] = useState("");
  const [inwardDate, setInwardDate] = useState(today);
  const [inwardSupplier, setInwardSupplier] = useState("");
  const [inwardNotes, setInwardNotes] = useState("");

  // Outward
  const [outwardMat, setOutwardMat] = useState("");
  const [outwardQty, setOutwardQty] = useState("");
  const [outwardDate, setOutwardDate] = useState(today);
  const [outwardArea, setOutwardArea] = useState("");
  const [outwardNotes, setOutwardNotes] = useState("");

  const totalValue = data.materials.reduce(
    (s, m) => s + m.currentStock * m.unitPrice,
    0,
  );
  const alertCount = data.materials.filter(
    (m) => getMaterialStatus(m) !== "OK",
  ).length;
  const recentDeliveries = data.materialTransactions.filter(
    (t) => t.type === "inward",
  ).length;
  const filteredMaterials = data.materials.filter((m) =>
    m.name.toLowerCase().includes(matSearch.toLowerCase()),
  );

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
    const mat = data.materials.find((m) => m.id === inwardMat);
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
      action: "Material Inward (GRN)",
      module: "Materials",
      details: `${Number(inwardQty)} ${mat?.unit ?? ""} of ${mat?.name ?? ""} received`,
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
    const mat = data.materials.find((m) => m.id === outwardMat);
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
      action: "Material Issue",
      module: "Materials",
      details: `${Number(outwardQty)} ${mat?.unit ?? ""} of ${mat?.name ?? ""} issued to ${outwardArea}`,
    });
    toast.success("Consumption recorded!");
    setOutwardQty("");
    setOutwardNotes("");
    setOutwardArea("");
  }

  return (
    <DashboardLayout
      title="Materials Engineer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0f172a]">
            Materials Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs text-slate-500">
                    Total Materials
                  </span>
                </div>
                <p className="text-2xl font-bold">{data.materials.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-slate-500">Low Stock</span>
                </div>
                <p className="text-2xl font-bold">{alertCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#f97316]" />
                  <span className="text-xs text-slate-500">Total Value</span>
                </div>
                <p className="text-xl font-bold">
                  {formatCurrency(totalValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs text-slate-500">GRN Records</span>
                </div>
                <p className="text-2xl font-bold">{recentDeliveries}</p>
              </CardContent>
            </Card>
          </div>
          {alertCount > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.materials
                  .filter((m) => getMaterialStatus(m) !== "OK")
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex justify-between items-center text-sm"
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

      {activeTab === "inventory" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search materials (A–Z)..."
              value={matSearch}
              onChange={(e) => setMatSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={() => {
                setEditMaterial(undefined);
                setMatModalOpen(true);
              }}
              data-ocid="me.material.button"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Material
            </Button>
            <Button
              variant="outline"
              className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10"
              onClick={() =>
                exportMaterialsPDF(
                  data.materials,
                  activeProject?.name ?? "Project",
                )
              }
              data-ocid="me.materials.upload_button"
            >
              <Download className="w-4 h-4 mr-1" /> Export PDF
            </Button>
            <Button
              variant="outline"
              className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10"
              onClick={() =>
                exportMaterialsCSV(
                  data.materials,
                  activeProject?.name ?? "Project",
                )
              }
              data-ocid="me.materials.secondary_button"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
          {filteredMaterials.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400"
              data-ocid="me.inventory.empty_state"
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
                      <TableHead>Price</TableHead>
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
                          data-ocid={`me.inventory.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {m.name}
                          </TableCell>
                          <TableCell>{m.unit}</TableCell>
                          <TableCell className="font-semibold">
                            {m.currentStock}
                          </TableCell>
                          <TableCell>{m.reorderLevel}</TableCell>
                          <TableCell>₹{m.unitPrice}</TableCell>
                          <TableCell>
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

      {activeTab === "grn" && (
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
                placeholder="Supplier name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes / Quality Check</Label>
              <Textarea
                value={inwardNotes}
                onChange={(e) => setInwardNotes(e.target.value)}
                className="mt-1"
                rows={2}
                placeholder="Quality remarks..."
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

      {activeTab === "outward" && (
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
                      {m.name} ({m.currentStock} {m.unit})
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
              <Label>Work Area / Stage</Label>
              <Input
                value={outwardArea}
                onChange={(e) => setOutwardArea(e.target.value)}
                placeholder="e.g. Floor 3, Foundation"
                className="mt-1"
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
              Issue Material
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#0f172a]">Material Alerts</h2>
          {alertCount === 0 ? (
            <div
              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700"
              data-ocid="me.alerts.empty_state"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">
                All materials are adequately stocked. No alerts.
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
                          Stock: {m.currentStock} {m.unit} | Reorder:{" "}
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
