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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext";
import type { Material } from "../../backend";
import DashboardLayout from "../../components/DashboardLayout";
import { useActor } from "../../hooks/useActor";

const mockInventory: Material[] = [
  { name: "Cement", quantity: BigInt(180), reorderLevel: BigInt(200) },
  { name: "Steel Rods", quantity: BigInt(450), reorderLevel: BigInt(150) },
  { name: "Sand", quantity: BigInt(800), reorderLevel: BigInt(300) },
  { name: "Bricks", quantity: BigInt(1200), reorderLevel: BigInt(400) },
  { name: "Gravel", quantity: BigInt(600), reorderLevel: BigInt(250) },
];

export default function MaterialsEngineerDashboard() {
  const { user } = useAuth();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // Update stock form
  const [stockId, setStockId] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  // Add material form
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matReorder, setMatReorder] = useState("");
  const [addingMat, setAddingMat] = useState(false);

  // Reorder alert form
  const [alertId, setAlertId] = useState("");
  const [alertLevel, setAlertLevel] = useState("");
  const [creatingAlert, setCreatingAlert] = useState(false);

  const { data: inventory = mockInventory, isLoading } = useQuery<Material[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      if (!actor) return mockInventory;
      try {
        const result = await actor.getInventory();
        return result.length > 0 ? result : mockInventory;
      } catch {
        return mockInventory;
      }
    },
    enabled: !!actor && !isFetching,
  });

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();
    if (!stockId || !stockQty) {
      toast.error("Fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Not connected.");
      return;
    }
    setUpdatingStock(true);
    try {
      await actor.updateStock(BigInt(stockId), BigInt(stockQty));
      toast.success("Stock updated!");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setStockId("");
      setStockQty("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdatingStock(false);
    }
  }

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!matName || !matQty || !matReorder) {
      toast.error("Fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Not connected.");
      return;
    }
    setAddingMat(true);
    try {
      await actor.addMaterial(matName, BigInt(matQty), BigInt(matReorder));
      toast.success(`Material "${matName}" added!`);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setMatName("");
      setMatQty("");
      setMatReorder("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Add material failed.");
    } finally {
      setAddingMat(false);
    }
  }

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!alertId || !alertLevel) {
      toast.error("Fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Not connected.");
      return;
    }
    setCreatingAlert(true);
    try {
      await actor.createReorderAlert(BigInt(alertId), BigInt(alertLevel));
      toast.success("Reorder alert created!");
      setAlertId("");
      setAlertLevel("");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Alert creation failed.",
      );
    } finally {
      setCreatingAlert(false);
    }
  }

  return (
    <DashboardLayout title="Materials Engineer Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B2B45]">
            Welcome, {user?.name ?? "Materials Engineer"} 📦
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Inventory management and stock control.
          </p>
        </div>

        {/* Inventory table */}
        <Card className="card-shadow border-border" data-ocid="inventory.table">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45] flex items-center gap-2">
              <Package className="w-5 h-5" /> Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="inventory.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-[#F28C2A]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Material
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Quantity
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Reorder Level
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, i) => {
                    const isLow =
                      Number(item.quantity) < Number(item.reorderLevel);
                    return (
                      <TableRow
                        key={item.name}
                        data-ocid={`inventory.item.${i + 1}`}
                        style={
                          isLow
                            ? { backgroundColor: "rgba(239,68,68,0.04)" }
                            : {}
                        }
                      >
                        <TableCell className="font-medium text-sm text-[#0B2B45]">
                          {item.name}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-semibold ${isLow ? "text-red-600" : "text-[#0B2B45]"}`}
                        >
                          {Number(item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-[#6B7280]">
                          {Number(item.reorderLevel).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={
                              isLow
                                ? {
                                    backgroundColor: "rgba(220,38,38,0.12)",
                                    color: "#DC2626",
                                  }
                                : {
                                    backgroundColor: "rgba(31,166,163,0.1)",
                                    color: "#1FA6A3",
                                  }
                            }
                          >
                            {isLow ? "LOW" : "OK"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Update Stock */}
          <Card
            className="card-shadow border-border"
            data-ocid="update_stock.panel"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0B2B45]">
                Update Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStock} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">Material ID</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1"
                    value={stockId}
                    onChange={(e) => setStockId(e.target.value)}
                    data-ocid="update_stock.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">New Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    data-ocid="update_stock.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updatingStock}
                  className="w-full rounded-full text-sm"
                  style={{ backgroundColor: "#0B2B45", color: "white" }}
                  data-ocid="update_stock.submit_button"
                >
                  {updatingStock ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Stock"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Material */}
          <Card
            className="card-shadow border-border"
            data-ocid="add_material.panel"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0B2B45]">
                Add Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">Name</Label>
                  <Input
                    placeholder="e.g. Timber"
                    value={matName}
                    onChange={(e) => setMatName(e.target.value)}
                    data-ocid="add_material.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 200"
                    value={matQty}
                    onChange={(e) => setMatQty(e.target.value)}
                    data-ocid="add_material.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">
                    Reorder Level
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={matReorder}
                    onChange={(e) => setMatReorder(e.target.value)}
                    data-ocid="add_material.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addingMat}
                  className="w-full rounded-full text-sm"
                  style={{ backgroundColor: "#F28C2A", color: "white" }}
                  data-ocid="add_material.submit_button"
                >
                  {addingMat ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Material"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reorder Alert */}
          <Card
            className="card-shadow border-border"
            data-ocid="reorder_alert.panel"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0B2B45] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#F28C2A]" />
                Create Reorder Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAlert} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">Material ID</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1"
                    value={alertId}
                    onChange={(e) => setAlertId(e.target.value)}
                    data-ocid="reorder_alert.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280]">
                    Reorder Level
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={alertLevel}
                    onChange={(e) => setAlertLevel(e.target.value)}
                    data-ocid="reorder_alert.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creatingAlert}
                  className="w-full rounded-full text-sm"
                  style={{ backgroundColor: "#1FA6A3", color: "white" }}
                  data-ocid="reorder_alert.submit_button"
                >
                  {creatingAlert ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Alert"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
