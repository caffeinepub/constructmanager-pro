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
import { useQuery } from "@tanstack/react-query";
import { BarChart2, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import type { Project } from "../../backend";
import DashboardLayout from "../../components/DashboardLayout";
import { useActor } from "../../hooks/useActor";

const mockProjects: Project[] = [
  {
    name: "Greenfield Residential Block A",
    site: "Chennai North",
    status: "Active",
    budget: BigInt(5000000),
  },
  {
    name: "Commercial Plaza Foundation",
    site: "Anna Nagar",
    status: "Active",
    budget: BigInt(12000000),
  },
  {
    name: "Highway Overpass Section 3",
    site: "Tambaram",
    status: "Completed",
    budget: BigInt(8500000),
  },
  {
    name: "Industrial Warehouse Unit 7",
    site: "Ambattur",
    status: "On Hold",
    budget: BigInt(3200000),
  },
];

const statusStyle: Record<string, { color: string; bg: string }> = {
  Active: { color: "#1FA6A3", bg: "rgba(31,166,163,0.1)" },
  Completed: { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  "On Hold": { color: "#F28C2A", bg: "rgba(242,140,42,0.1)" },
};

export default function ChiefEngineerDashboard() {
  const { user } = useAuth();
  const { actor, isFetching } = useActor();
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [approving, setApproving] = useState(false);

  const { data: projects = mockProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return mockProjects;
      try {
        const result = await actor.getProjectOverview();
        return result.length > 0 ? result : mockProjects;
      } catch {
        return mockProjects;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const total = projects.length;
  const active = projects.filter((p) => p.status === "Active").length;

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    if (!materialName || !quantity) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    setApproving(true);
    try {
      await actor.approveMaterialRequest(materialName, BigInt(quantity));
      toast.success(`Approved ${quantity} units of ${materialName}.`);
      setMaterialName("");
      setQuantity("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setApproving(false);
    }
  }

  return (
    <DashboardLayout title="Chief Engineer Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B2B45]">
            Welcome, {user?.name ?? "Chief Engineer"} 🏗️
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Project overview and material approvals.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Total Projects", value: total, color: "#0B2B45" },
            { label: "Active Projects", value: active, color: "#1FA6A3" },
          ].map((stat, i) => (
            <Card
              key={stat.label}
              className="card-shadow border-border"
              data-ocid={`projects.card.${i + 1}`}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <BarChart2
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                  />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects table */}
        <Card className="card-shadow border-border" data-ocid="projects.table">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45]">
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="projects.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-[#F28C2A]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Project
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Site
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Budget
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p, i) => {
                    const style = statusStyle[p.status] ?? {
                      color: "#64748b",
                      bg: "rgba(100,116,139,0.1)",
                    };
                    return (
                      <TableRow
                        key={p.name}
                        data-ocid={`projects.item.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm text-[#0B2B45]">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-sm text-[#6B7280]">
                          {p.site}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: style.bg,
                              color: style.color,
                            }}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-[#0B2B45]">
                          ₹{Number(p.budget).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Approve Material Request */}
        <Card
          className="card-shadow border-border"
          data-ocid="approve_material.panel"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#1FA6A3]" /> Approve
              Material Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleApprove}
              className="flex flex-wrap gap-4 items-end"
            >
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <Label className="text-sm text-[#6B7280]">Material Name</Label>
                <Input
                  placeholder="e.g. Cement"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  data-ocid="approve_material.input"
                />
              </div>
              <div className="space-y-1.5 w-32">
                <Label className="text-sm text-[#6B7280]">Quantity</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-ocid="approve_material.input"
                />
              </div>
              <Button
                type="submit"
                disabled={approving}
                className="rounded-full"
                style={{ backgroundColor: "#F28C2A", color: "white" }}
                data-ocid="approve_material.submit_button"
              >
                {approving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
