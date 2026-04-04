import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import {
  canisterAddMaterial,
  canisterAddProgress,
  canisterAddWorker,
  canisterApprovePayroll,
  canisterGetAttendance,
  canisterGetAuditLog,
  canisterGetMaterialTx,
  canisterGetMaterials,
  canisterGetPayroll,
  canisterGetProgress,
  canisterGetWorkers,
  canisterMarkAttendance,
  canisterRecordTx,
  canisterSubmitPayroll,
  canisterUpdateMaterial,
  canisterUpdateWorker,
} from "./canister";

// ---- Types ----
export interface Worker {
  id: string;
  name: string;
  skill: string;
  dailyWageRate: number;
  contact: string;
  dialCode?: string;
  email?: string;
  status: "Active" | "Inactive";
}

export interface AttendanceRecord {
  workerId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  type: "inward" | "outward";
  quantity: number;
  date: string;
  notes: string;
  workArea?: string;
  supplier?: string;
  by: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  percentage: number;
  notes: string;
  by: string;
  photos?: string[];
}

export interface PayrollSubmission {
  id: string;
  period: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  reactions: string[];
}

export interface ProjectData {
  workers: Worker[];
  attendance: AttendanceRecord[];
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  progressHistory: ProgressEntry[];
  currentProgress: number;
  payroll: PayrollSubmission[];
  budget: number;
  auditLog: AuditEntry[];
  isLoading: boolean;
}

const EMPTY_PROJECT_DATA: ProjectData = {
  workers: [],
  attendance: [],
  materials: [],
  materialTransactions: [],
  progressHistory: [],
  currentProgress: 0,
  payroll: [],
  budget: 0,
  auditLog: [],
  isLoading: false,
};

// ---- Context ----
interface ProjectDataContextType {
  data: ProjectData;
  reloadData: () => Promise<void>;
  // Workers — old API compatible (no userEmail/projectId args)
  addWorker: (w: Omit<Worker, "id" | "status">) => void;
  updateWorker: (id: string, w: Partial<Worker>) => void;
  // Attendance
  setAttendance: (workerId: string, date: string, present: boolean) => void;
  // Materials
  addMaterial: (m: Omit<Material, "id">) => void;
  updateMaterial: (id: string, m: Partial<Material>) => void;
  recordInward: (t: Omit<MaterialTransaction, "id" | "type">) => void;
  recordOutward: (t: Omit<MaterialTransaction, "id" | "type">) => void;
  // Progress
  updateProgress: (
    pct: number,
    notes: string,
    by: string,
    photos?: string[],
  ) => void;
  // Payroll
  submitPayroll: (period: string, amount: number, by: string) => void;
  reviewPayroll: (
    id: string,
    status: "approved" | "rejected",
    reviewer: string,
  ) => void;
  // Budget (local only)
  setBudget: (amount: number) => void;
  // Audit (appended after mutations)
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | null>(null);

export function useProjectData() {
  const ctx = useContext(ProjectDataContext);
  if (!ctx)
    throw new Error("useProjectData must be used within ProjectDataProvider");
  return ctx;
}

interface Props {
  children: ReactNode;
  projectId: string | null;
  userEmail?: string;
}

export function ProjectDataProvider({ children, projectId, userEmail }: Props) {
  const [data, setData] = useState<ProjectData>({ ...EMPTY_PROJECT_DATA });

  const loadAllData = useCallback(
    async (pid: string) => {
      setData((prev) => ({ ...prev, isLoading: true }));
      try {
        const numericId = Number(pid);
        const [
          canisterWorkers,
          canisterAttendance,
          canisterMaterials,
          canisterTxs,
          canisterProgress,
          canisterPayroll,
          canisterAudit,
        ] = await Promise.all([
          canisterGetWorkers(numericId),
          canisterGetAttendance(numericId),
          canisterGetMaterials(numericId),
          canisterGetMaterialTx(numericId),
          canisterGetProgress(numericId),
          canisterGetPayroll(numericId),
          canisterGetAuditLog(userEmail ?? "", numericId),
        ]);

        // Map workers
        const workers: Worker[] = canisterWorkers.map((w) => ({
          id: String(Number(w.id)),
          name: w.name,
          skill: w.skill,
          dailyWageRate: Number(w.dailyWage),
          contact: w.phone,
          dialCode: w.dialCode,
          email: w.wEmail,
          status: "Active" as const,
        }));

        // Map attendance
        const attendance: AttendanceRecord[] = canisterAttendance.map((a) => ({
          workerId: String(Number(a.workerId)),
          date: a.date,
          present: a.status === "present",
        }));

        // Map materials (sorted A-Z)
        const materials: Material[] = canisterMaterials
          .map((m) => ({
            id: String(Number(m.id)),
            name: m.name,
            unit: m.unit,
            currentStock: Number(m.stock),
            reorderLevel: Number(m.reorderLevel),
            unitPrice: Number(m.priceUsd),
            supplier: m.supplier,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // Map material transactions
        const materialTransactions: MaterialTransaction[] = canisterTxs.map(
          (t) => ({
            id: String(Number(t.id)),
            materialId: String(Number(t.materialId)),
            type: t.txType === "inward" ? "inward" : ("outward" as const),
            quantity: Number(t.qty),
            date: t.date,
            notes: t.notes,
            by: t.byEmail,
          }),
        );

        // Map progress entries
        const progressHistory: ProgressEntry[] = canisterProgress.map((e) => ({
          id: String(Number(e.id)),
          percentage: Number(e.pct),
          notes: e.notes,
          date: e.date,
          by: e.byEmail,
          photos: e.photos,
        }));
        const currentProgress =
          progressHistory.length > 0
            ? progressHistory[progressHistory.length - 1].percentage
            : 0;

        // Map payroll
        const payroll: PayrollSubmission[] = canisterPayroll.map((p) => ({
          id: String(Number(p.id)),
          period: p.period,
          totalAmount: Number(p.totalAmount),
          status: (p.status === "approved"
            ? "approved"
            : p.status === "rejected"
              ? "rejected"
              : "pending") as "pending" | "approved" | "rejected",
          submittedBy: p.submittedBy,
          submittedAt: p.period,
          reviewedBy: p.approvedBy || undefined,
        }));

        // Map audit log
        const auditLog: AuditEntry[] = canisterAudit.map((a) => ({
          id: String(Number(a.id)),
          timestamp: a.timestamp,
          user: a.userEmail,
          action: a.action,
          module: a.area,
          details: a.details,
        }));

        setData({
          workers,
          attendance,
          materials,
          materialTransactions,
          progressHistory,
          currentProgress,
          payroll,
          budget: 0,
          auditLog,
          isLoading: false,
        });
      } catch (err) {
        console.error("Failed to load project data:", err);
        toast.error("Failed to load project data from canister");
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [userEmail],
  );

  useEffect(() => {
    if (projectId) {
      loadAllData(projectId);
    } else {
      setData({ ...EMPTY_PROJECT_DATA });
    }
  }, [projectId, loadAllData]);

  const reloadData = useCallback(async () => {
    if (projectId) await loadAllData(projectId);
  }, [projectId, loadAllData]);

  // ---- Workers ----
  const addWorker = useCallback(
    (w: Omit<Worker, "id" | "status">) => {
      if (!projectId || !userEmail) {
        // optimistic local update for demo mode
        setData((prev) => ({
          ...prev,
          workers: [
            ...prev.workers,
            { ...w, id: Date.now().toString(), status: "Active" as const },
          ],
        }));
        return;
      }
      canisterAddWorker(
        userEmail,
        Number(projectId),
        w.name,
        w.skill,
        w.dailyWageRate,
        w.contact,
        w.email ?? "",
        w.dialCode ?? "",
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  const updateWorker = useCallback(
    (id: string, w: Partial<Worker>) => {
      if (!projectId || !userEmail) {
        setData((prev) => ({
          ...prev,
          workers: prev.workers.map((x) => (x.id === id ? { ...x, ...w } : x)),
        }));
        return;
      }
      const current = data.workers.find((x) => x.id === id);
      if (!current) return;
      canisterUpdateWorker(
        userEmail,
        Number(projectId),
        Number(id),
        w.name ?? current.name,
        w.skill ?? current.skill,
        w.dailyWageRate ?? current.dailyWageRate,
        w.contact ?? current.contact,
        w.email ?? current.email ?? "",
        w.dialCode ?? current.dialCode ?? "",
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, data.workers, loadAllData],
  );

  // ---- Attendance ----
  const setAttendance = useCallback(
    (workerId: string, date: string, present: boolean) => {
      // Optimistic update
      setData((prev) => {
        const existing = prev.attendance.find(
          (a) => a.workerId === workerId && a.date === date,
        );
        if (existing) {
          return {
            ...prev,
            attendance: prev.attendance.map((a) =>
              a.workerId === workerId && a.date === date
                ? { ...a, present }
                : a,
            ),
          };
        }
        return {
          ...prev,
          attendance: [...prev.attendance, { workerId, date, present }],
        };
      });

      if (!projectId || !userEmail) return;
      canisterMarkAttendance(
        userEmail,
        Number(projectId),
        Number(workerId),
        date,
        present ? "present" : "absent",
      ).catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail],
  );

  // ---- Materials ----
  const addMaterial = useCallback(
    (m: Omit<Material, "id">) => {
      if (!projectId || !userEmail) {
        setData((prev) => ({
          ...prev,
          materials: [
            ...prev.materials,
            { ...m, id: Date.now().toString() },
          ].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        return;
      }
      canisterAddMaterial(
        userEmail,
        Number(projectId),
        m.name,
        m.unit,
        m.currentStock,
        m.reorderLevel,
        m.unitPrice,
        m.supplier,
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  const updateMaterial = useCallback(
    (id: string, m: Partial<Material>) => {
      if (!projectId || !userEmail) {
        setData((prev) => ({
          ...prev,
          materials: prev.materials
            .map((x) => (x.id === id ? { ...x, ...m } : x))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
        return;
      }
      const current = data.materials.find((x) => x.id === id);
      if (!current) return;
      canisterUpdateMaterial(
        userEmail,
        Number(projectId),
        Number(id),
        m.name ?? current.name,
        m.unit ?? current.unit,
        m.currentStock ?? current.currentStock,
        m.reorderLevel ?? current.reorderLevel,
        m.unitPrice ?? current.unitPrice,
        m.supplier ?? current.supplier,
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, data.materials, loadAllData],
  );

  const recordInward = useCallback(
    (t: Omit<MaterialTransaction, "id" | "type">) => {
      if (!projectId || !userEmail) {
        setData((prev) => ({
          ...prev,
          materials: prev.materials
            .map((m) =>
              m.id === t.materialId
                ? { ...m, currentStock: m.currentStock + t.quantity }
                : m,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
          materialTransactions: [
            ...prev.materialTransactions,
            { ...t, id: Date.now().toString(), type: "inward" as const },
          ],
        }));
        return;
      }
      canisterRecordTx(
        userEmail,
        Number(projectId),
        Number(t.materialId),
        "inward",
        t.quantity,
        t.date,
        t.notes,
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  const recordOutward = useCallback(
    (t: Omit<MaterialTransaction, "id" | "type">) => {
      if (!projectId || !userEmail) {
        setData((prev) => ({
          ...prev,
          materials: prev.materials
            .map((m) =>
              m.id === t.materialId
                ? {
                    ...m,
                    currentStock: Math.max(0, m.currentStock - t.quantity),
                  }
                : m,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
          materialTransactions: [
            ...prev.materialTransactions,
            { ...t, id: Date.now().toString(), type: "outward" as const },
          ],
        }));
        return;
      }
      canisterRecordTx(
        userEmail,
        Number(projectId),
        Number(t.materialId),
        "outward",
        t.quantity,
        t.date,
        t.notes,
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  // ---- Progress ----
  const updateProgress = useCallback(
    (pct: number, notes: string, _by: string, photos?: string[]) => {
      if (!projectId || !userEmail) {
        const entry: ProgressEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          percentage: pct,
          notes,
          by: _by,
          photos: photos ?? [],
        };
        setData((prev) => ({
          ...prev,
          currentProgress: pct,
          progressHistory: [...prev.progressHistory, entry],
        }));
        return;
      }
      const date = new Date().toISOString().split("T")[0];
      canisterAddProgress(
        userEmail,
        Number(projectId),
        pct,
        notes,
        date,
        photos ?? [],
      )
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  // ---- Payroll ----
  const submitPayroll = useCallback(
    (period: string, amount: number, _by: string) => {
      if (!projectId || !userEmail) {
        const sub: PayrollSubmission = {
          id: Date.now().toString(),
          period,
          totalAmount: amount,
          status: "pending",
          submittedBy: _by,
          submittedAt: new Date().toISOString().split("T")[0],
        };
        setData((prev) => ({ ...prev, payroll: [...prev.payroll, sub] }));
        return;
      }
      canisterSubmitPayroll(userEmail, Number(projectId), period, amount)
        .then((result) => {
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          loadAllData(projectId);
        })
        .catch((err) => toast.error(String(err)));
    },
    [projectId, userEmail, loadAllData],
  );

  const reviewPayroll = useCallback(
    (id: string, status: "approved" | "rejected", reviewer: string) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        payroll: prev.payroll.map((p) =>
          p.id === id ? { ...p, status, reviewedBy: reviewer } : p,
        ),
      }));

      if (!projectId || !userEmail) return;
      if (status === "approved") {
        canisterApprovePayroll(userEmail, Number(projectId), Number(id))
          .then((result) => {
            if (!result.ok) {
              toast.error(result.message);
            }
            loadAllData(projectId);
          })
          .catch((err) => toast.error(String(err)));
      }
    },
    [projectId, userEmail, loadAllData],
  );

  const setBudget = useCallback((amount: number) => {
    setData((prev) => ({ ...prev, budget: amount }));
  }, []);

  const addAuditEntry = useCallback(
    (entry: Omit<AuditEntry, "id" | "timestamp">) => {
      const full: AuditEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
      };
      setData((prev) => ({ ...prev, auditLog: [full, ...prev.auditLog] }));
    },
    [],
  );

  return (
    <ProjectDataContext.Provider
      value={{
        data,
        reloadData,
        addWorker,
        updateWorker,
        setAttendance,
        addMaterial,
        updateMaterial,
        recordInward,
        recordOutward,
        updateProgress,
        submitPayroll,
        reviewPayroll,
        setBudget,
        addAuditEntry,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  );
}
