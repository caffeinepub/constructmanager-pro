import { Badge } from "@/components/ui/badge";
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
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useProjectData } from "../../ProjectDataContext";
import DashboardLayout from "../../components/DashboardLayout";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getMaterialStatus(m: { currentStock: number; reorderLevel: number }):
  | "OK"
  | "Low"
  | "Critical" {
  if (m.currentStock <= m.reorderLevel * 0.5) return "Critical";
  if (m.currentStock <= m.reorderLevel) return "Low";
  return "OK";
}

export default function SiteOwnerDashboard() {
  const { data } = useProjectData();
  const [activeTab, setActiveTab] = useState("overview");

  const totalMaterialValue = data.materials.reduce(
    (s, m) => s + m.currentStock * m.unitPrice,
    0,
  );
  const totalLabourCost = data.workers.reduce((s, w) => {
    const days = data.attendance.filter(
      (a) => a.workerId === w.id && a.present,
    ).length;
    return s + days * w.dailyWageRate;
  }, 0);
  const budgetUsed = totalLabourCost + totalMaterialValue;
  const budgetPct =
    data.budget > 0 ? Math.round((budgetUsed / data.budget) * 100) : 0;
  const alertCount = data.materials.filter(
    (m) => getMaterialStatus(m) !== "OK",
  ).length;

  // Top 5 materials by value
  const topMaterials = [...data.materials]
    .sort((a, b) => b.currentStock * b.unitPrice - a.currentStock * a.unitPrice)
    .slice(0, 5);

  return (
    <DashboardLayout
      title="Site Owner"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0f172a]">
              Executive Overview
            </h2>
            <Badge className="bg-purple-100 text-purple-700">View Only</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Users className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs text-slate-500">Workers</span>
                </div>
                <p className="text-2xl font-bold">{data.workers.length}</p>
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
                <p className="text-xl font-bold">
                  {formatCurrency(totalMaterialValue)}
                </p>
                {alertCount > 0 && (
                  <p className="text-xs text-orange-500">{alertCount} alerts</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs text-slate-500">Labour Cost</span>
                </div>
                <p className="text-xl font-bold">
                  {formatCurrency(totalLabourCost)}
                </p>
              </CardContent>
            </Card>
          </div>

          {data.budget > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-[#0f172a]">
                    Budget vs Actual
                  </span>
                  <span className="text-sm text-slate-500">
                    {formatCurrency(budgetUsed)} / {formatCurrency(data.budget)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-[#10b981]"}`}
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">
                    {budgetPct}% used
                  </span>
                  <span className="text-xs text-slate-400">
                    Remaining: {formatCurrency(data.budget - budgetUsed)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#0f172a]">
              Project Progress
            </h2>
            <Badge className="bg-purple-100 text-purple-700">View Only</Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border p-8">
              <div className="relative w-36 h-36">
                <svg
                  viewBox="0 0 36 36"
                  className="w-36 h-36 -rotate-90"
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
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeDasharray={`${data.currentProgress} ${100 - data.currentProgress}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0f172a]">
                    {data.currentProgress}%
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                Project Completion
              </p>
            </div>
            <div className="flex-1 bg-white rounded-2xl border p-6">
              <h3 className="font-semibold text-[#0f172a] mb-4">
                Progress Timeline
              </h3>
              <div className="space-y-3">
                {data.progressHistory.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No progress updates yet.
                  </p>
                ) : (
                  [...data.progressHistory].reverse().map((p) => (
                    <div key={p.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#8b5cf6]">
                          {p.percentage}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0f172a]">
                          {p.date}
                        </p>
                        <p className="text-xs text-slate-500">{p.notes}</p>
                        <p className="text-xs text-slate-400">
                          Updated by {p.by}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#0f172a]">
              Materials Summary
            </h2>
            <Badge className="bg-purple-100 text-purple-700">View Only</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Materials</p>
                <p className="text-2xl font-bold">{data.materials.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Inventory Value</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalMaterialValue)}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Top Materials by Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMaterials.map((m, i) => {
                    const st = getMaterialStatus(m);
                    return (
                      <TableRow
                        key={m.id}
                        data-ocid={`so.materials.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          {m.currentStock} {m.unit}
                        </TableCell>
                        <TableCell>₹{m.unitPrice}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(m.currentStock * m.unitPrice)}
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "labour" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#0f172a]">Labour Summary</h2>
            <Badge className="bg-purple-100 text-purple-700">View Only</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Workers</p>
                <p className="text-2xl font-bold">{data.workers.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Wages Paid</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalLabourCost)}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.workers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-slate-400 py-8"
                      >
                        No workers in this project yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.workers.map((w, i) => (
                      <TableRow
                        key={w.id}
                        data-ocid={`so.labour.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell>{w.skill}</TableCell>
                        <TableCell>₹{w.dailyWageRate}/day</TableCell>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0f172a]">
            Financial Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-500">Labour Cost</span>
                  <span className="font-semibold">
                    {formatCurrency(totalLabourCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-500">Materials Cost</span>
                  <span className="font-semibold">
                    {formatCurrency(totalMaterialValue)}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Total Spent</span>
                  <span className="text-[#f97316]">
                    {formatCurrency(budgetUsed)}
                  </span>
                </div>
                {data.budget > 0 && (
                  <div className="flex justify-between py-2 text-slate-500">
                    <span>Budget</span>
                    <span>{formatCurrency(data.budget)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payroll.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-slate-400 py-4"
                        >
                          No payroll records.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.payroll.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.period}</TableCell>
                          <TableCell>{formatCurrency(p.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                p.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
