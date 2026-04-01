import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ---- Types ----
export interface Worker {
  id: string;
  name: string;
  skill: string;
  dailyWageRate: number;
  contact: string;
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
}

// ---- Demo Data ----
const today = new Date().toISOString().split("T")[0];
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const DEMO_WORKERS_ALPHA: Worker[] = [
  {
    id: "w1",
    name: "Rajesh Kumar",
    skill: "Mason",
    dailyWageRate: 600,
    contact: "+91-98765-43210",
    status: "Active",
  },
  {
    id: "w2",
    name: "Sudhir Singh",
    skill: "Carpenter",
    dailyWageRate: 700,
    contact: "+91-87654-32109",
    status: "Active",
  },
  {
    id: "w3",
    name: "Mohan Lal",
    skill: "Electrician",
    dailyWageRate: 800,
    contact: "+91-76543-21098",
    status: "Active",
  },
  {
    id: "w4",
    name: "Amar Nath",
    skill: "Plumber",
    dailyWageRate: 750,
    contact: "+91-65432-10987",
    status: "Active",
  },
  {
    id: "w5",
    name: "Vijay Kumar",
    skill: "Helper",
    dailyWageRate: 400,
    contact: "+91-54321-09876",
    status: "Active",
  },
  {
    id: "w6",
    name: "Ravi Shankar",
    skill: "Supervisor",
    dailyWageRate: 1000,
    contact: "+91-43210-98765",
    status: "Active",
  },
];

const DEMO_ATTENDANCE_ALPHA: AttendanceRecord[] = [
  ...["w1", "w2", "w3", "w4", "w5", "w6"].flatMap((wid) => [
    { workerId: wid, date: daysAgo(6), present: true },
    { workerId: wid, date: daysAgo(5), present: wid !== "w5" },
    { workerId: wid, date: daysAgo(4), present: true },
    { workerId: wid, date: daysAgo(3), present: wid !== "w3" },
    { workerId: wid, date: daysAgo(2), present: true },
    { workerId: wid, date: daysAgo(1), present: true },
    { workerId: wid, date: today, present: wid !== "w4" },
  ]),
];

const DEMO_MATERIALS_ALPHA: Material[] = [
  {
    id: "m1",
    name: "Bricks (Red)",
    unit: "pieces",
    currentStock: 5000,
    reorderLevel: 1000,
    unitPrice: 8,
    supplier: "BrickMart",
  },
  {
    id: "m2",
    name: "Cement (OPC 53)",
    unit: "bags",
    currentStock: 200,
    reorderLevel: 50,
    unitPrice: 380,
    supplier: "UltraTech",
  },
  {
    id: "m3",
    name: "Gravel",
    unit: "tons",
    currentStock: 15,
    reorderLevel: 5,
    unitPrice: 1200,
    supplier: "QuarryCo",
  },
  {
    id: "m4",
    name: "Paint (White)",
    unit: "liters",
    currentStock: 25,
    reorderLevel: 20,
    unitPrice: 120,
    supplier: "Asian Paints",
  },
  {
    id: "m5",
    name: "Sand (Fine)",
    unit: "tons",
    currentStock: 4,
    reorderLevel: 5,
    unitPrice: 900,
    supplier: "QuarryCo",
  },
  {
    id: "m6",
    name: "Steel Bars (12mm)",
    unit: "kg",
    currentStock: 2000,
    reorderLevel: 500,
    unitPrice: 68,
    supplier: "JSW Steel",
  },
  {
    id: "m7",
    name: "Timber (Teak)",
    unit: "pieces",
    currentStock: 50,
    reorderLevel: 10,
    unitPrice: 850,
    supplier: "Wood World",
  },
  {
    id: "m8",
    name: "Wire (Electrical)",
    unit: "kg",
    currentStock: 150,
    reorderLevel: 30,
    unitPrice: 95,
    supplier: "Polycab",
  },
];

const DEMO_PROGRESS_ALPHA: ProgressEntry[] = [
  {
    id: "p1",
    date: daysAgo(14),
    percentage: 10,
    notes: "Foundation work completed. Columns started.",
    by: "Priya Nair",
  },
  {
    id: "p2",
    date: daysAgo(10),
    percentage: 22,
    notes: "Slab casting on 1st floor done.",
    by: "Priya Nair",
  },
  {
    id: "p3",
    date: daysAgo(7),
    percentage: 35,
    notes: "Brickwork completed up to 2nd floor.",
    by: "Priya Nair",
  },
  {
    id: "p4",
    date: daysAgo(3),
    percentage: 45,
    notes: "Plastering started on 1st floor. Electrical rough-in underway.",
    by: "Priya Nair",
  },
];

const DEMO_PAYROLL_ALPHA: PayrollSubmission[] = [
  {
    id: "pr1",
    period: "Week 1 (Nov 2024)",
    totalAmount: 28400,
    status: "approved",
    submittedBy: "Priya Nair",
    submittedAt: daysAgo(7),
    reviewedBy: "Arjun Ramesh",
  },
  {
    id: "pr2",
    period: "Week 2 (Nov 2024)",
    totalAmount: 31200,
    status: "pending",
    submittedBy: "Priya Nair",
    submittedAt: daysAgo(1),
  },
];

const DEMO_AUDIT_ALPHA: AuditEntry[] = [
  {
    id: "a1",
    timestamp: `${daysAgo(14)} 09:00`,
    user: "Arjun Ramesh",
    action: "Created Project",
    module: "Admin",
    details: "Project Alpha created with budget ₹50,00,000",
  },
  {
    id: "a2",
    timestamp: `${daysAgo(13)} 10:30`,
    user: "Arjun Ramesh",
    action: "Added Worker",
    module: "Labour",
    details: "Added Rajesh Kumar (Mason)",
  },
  {
    id: "a3",
    timestamp: `${daysAgo(12)} 11:00`,
    user: "Dinesh Babu",
    action: "Added Material",
    module: "Materials",
    details: "Added Cement (OPC 53) - 200 bags",
  },
  {
    id: "a4",
    timestamp: `${daysAgo(10)} 14:00`,
    user: "Priya Nair",
    action: "Updated Progress",
    module: "Progress",
    details: "Progress updated to 22%",
  },
  {
    id: "a5",
    timestamp: `${daysAgo(7)} 15:30`,
    user: "Priya Nair",
    action: "Submitted Payroll",
    module: "Labour",
    details: "Week 1 payroll ₹28,400 submitted",
  },
  {
    id: "a6",
    timestamp: `${daysAgo(7)} 16:00`,
    user: "Arjun Ramesh",
    action: "Approved Payroll",
    module: "Labour",
    details: "Week 1 payroll approved",
  },
  {
    id: "a7",
    timestamp: `${daysAgo(3)} 09:30`,
    user: "Dinesh Babu",
    action: "Material Inward",
    module: "Materials",
    details: "Steel Bars 500kg received from JSW Steel",
  },
  {
    id: "a8",
    timestamp: `${daysAgo(1)} 17:00`,
    user: "Priya Nair",
    action: "Submitted Payroll",
    module: "Labour",
    details: "Week 2 payroll ₹31,200 submitted",
  },
];

const DEMO_MAT_TRANS_ALPHA: MaterialTransaction[] = [
  {
    id: "t1",
    materialId: "m6",
    type: "inward",
    quantity: 500,
    date: daysAgo(3),
    notes: "Quality checked. All bars 12mm ISI.",
    supplier: "JSW Steel",
    by: "Dinesh Babu",
  },
  {
    id: "t2",
    materialId: "m2",
    type: "outward",
    quantity: 50,
    date: daysAgo(5),
    notes: "Used for 2nd floor columns.",
    workArea: "Floor 2",
    by: "Dinesh Babu",
  },
  {
    id: "t3",
    materialId: "m1",
    type: "outward",
    quantity: 1200,
    date: daysAgo(4),
    notes: "Brickwork 2nd floor.",
    workArea: "Floor 2",
    by: "Dinesh Babu",
  },
  {
    id: "t4",
    materialId: "m5",
    type: "inward",
    quantity: 3,
    date: daysAgo(2),
    notes: "Sand delivery from QuarryCo.",
    supplier: "QuarryCo",
    by: "Dinesh Babu",
  },
];

// Demo data per project id
const DEMO_DATA: Record<string, Partial<ProjectData>> = {
  alpha: {
    workers: DEMO_WORKERS_ALPHA,
    attendance: DEMO_ATTENDANCE_ALPHA,
    materials: DEMO_MATERIALS_ALPHA,
    materialTransactions: DEMO_MAT_TRANS_ALPHA,
    progressHistory: DEMO_PROGRESS_ALPHA,
    currentProgress: 45,
    payroll: DEMO_PAYROLL_ALPHA,
    budget: 5000000,
    auditLog: DEMO_AUDIT_ALPHA,
  },
  beta: {
    workers: [
      {
        id: "w1",
        name: "Kumar Selvam",
        skill: "Mason",
        dailyWageRate: 620,
        contact: "+91-90000-11111",
        status: "Active",
      },
      {
        id: "w2",
        name: "Babu Reddy",
        skill: "Welder",
        dailyWageRate: 850,
        contact: "+91-90000-22222",
        status: "Active",
      },
    ],
    attendance: [],
    materials: [
      {
        id: "m1",
        name: "Cement (PPC)",
        unit: "bags",
        currentStock: 400,
        reorderLevel: 100,
        unitPrice: 360,
        supplier: "ACC",
      },
      {
        id: "m2",
        name: "Steel Rods (16mm)",
        unit: "kg",
        currentStock: 1500,
        reorderLevel: 400,
        unitPrice: 72,
        supplier: "SAIL",
      },
      {
        id: "m3",
        name: "TMT Bars",
        unit: "kg",
        currentStock: 800,
        reorderLevel: 200,
        unitPrice: 65,
        supplier: "SAIL",
      },
    ],
    progressHistory: [
      {
        id: "p1",
        date: daysAgo(10),
        percentage: 15,
        notes: "Foundation piling complete.",
        by: "Site Engineer",
      },
    ],
    currentProgress: 15,
    payroll: [],
    budget: 12000000,
    auditLog: [],
  },
  tower: {
    workers: [],
    attendance: [],
    materials: [
      {
        id: "m1",
        name: "Aggregate (20mm)",
        unit: "tons",
        currentStock: 30,
        reorderLevel: 10,
        unitPrice: 1500,
        supplier: "QuarryCo",
      },
      {
        id: "m2",
        name: "Bitumen",
        unit: "tons",
        currentStock: 5,
        reorderLevel: 2,
        unitPrice: 42000,
        supplier: "HPCL",
      },
      {
        id: "m3",
        name: "Cement (OPC 53)",
        unit: "bags",
        currentStock: 100,
        reorderLevel: 50,
        unitPrice: 380,
        supplier: "UltraTech",
      },
    ],
    progressHistory: [],
    currentProgress: 0,
    payroll: [],
    budget: 8500000,
    auditLog: [],
    materialTransactions: [],
  },
};

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
};

function loadData(projectId: string): ProjectData {
  const key = `constructmanager_pdata_${projectId}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as ProjectData;
  } catch {
    /* ignore */
  }
  const demo = DEMO_DATA[projectId];
  if (demo) return { ...EMPTY_PROJECT_DATA, ...demo } as ProjectData;
  return { ...EMPTY_PROJECT_DATA };
}

function saveData(projectId: string, data: ProjectData) {
  const key = `constructmanager_pdata_${projectId}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ---- Context ----
interface ProjectDataContextType {
  data: ProjectData;
  // Workers
  addWorker: (w: Omit<Worker, "id">) => void;
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
  // Budget
  setBudget: (amount: number) => void;
  // Audit
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
}

export function ProjectDataProvider({ children, projectId }: Props) {
  const [data, setData] = useState<ProjectData>(() =>
    projectId ? loadData(projectId) : { ...EMPTY_PROJECT_DATA },
  );

  // Reload when project changes
  useEffect(() => {
    if (projectId) setData(loadData(projectId));
    else setData({ ...EMPTY_PROJECT_DATA });
  }, [projectId]);

  // Persist on change
  useEffect(() => {
    if (projectId) saveData(projectId, data);
  }, [data, projectId]);

  const updateData = useCallback(
    (updater: (prev: ProjectData) => ProjectData) => {
      setData(updater);
    },
    [],
  );

  const addWorker = useCallback(
    (w: Omit<Worker, "id">) => {
      updateData((prev) => ({
        ...prev,
        workers: [...prev.workers, { ...w, id: Date.now().toString() }],
      }));
    },
    [updateData],
  );

  const updateWorker = useCallback(
    (id: string, w: Partial<Worker>) => {
      updateData((prev) => ({
        ...prev,
        workers: prev.workers.map((x) => (x.id === id ? { ...x, ...w } : x)),
      }));
    },
    [updateData],
  );

  const setAttendance = useCallback(
    (workerId: string, date: string, present: boolean) => {
      updateData((prev) => {
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
    },
    [updateData],
  );

  const addMaterial = useCallback(
    (m: Omit<Material, "id">) => {
      updateData((prev) => ({
        ...prev,
        materials: [
          ...prev.materials,
          { ...m, id: Date.now().toString() },
        ].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    },
    [updateData],
  );

  const updateMaterial = useCallback(
    (id: string, m: Partial<Material>) => {
      updateData((prev) => ({
        ...prev,
        materials: prev.materials
          .map((x) => (x.id === id ? { ...x, ...m } : x))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
    },
    [updateData],
  );

  const recordInward = useCallback(
    (t: Omit<MaterialTransaction, "id" | "type">) => {
      updateData((prev) => {
        const updated = prev.materials.map((m) =>
          m.id === t.materialId
            ? { ...m, currentStock: m.currentStock + t.quantity }
            : m,
        );
        return {
          ...prev,
          materials: updated.sort((a, b) => a.name.localeCompare(b.name)),
          materialTransactions: [
            ...prev.materialTransactions,
            { ...t, id: Date.now().toString(), type: "inward" as const },
          ],
        };
      });
    },
    [updateData],
  );

  const recordOutward = useCallback(
    (t: Omit<MaterialTransaction, "id" | "type">) => {
      updateData((prev) => {
        const updated = prev.materials.map((m) =>
          m.id === t.materialId
            ? { ...m, currentStock: Math.max(0, m.currentStock - t.quantity) }
            : m,
        );
        return {
          ...prev,
          materials: updated.sort((a, b) => a.name.localeCompare(b.name)),
          materialTransactions: [
            ...prev.materialTransactions,
            { ...t, id: Date.now().toString(), type: "outward" as const },
          ],
        };
      });
    },
    [updateData],
  );

  const updateProgress = useCallback(
    (pct: number, notes: string, by: string, photos?: string[]) => {
      const entry: ProgressEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        percentage: pct,
        notes,
        by,
        photos: photos ?? [],
      };
      updateData((prev) => ({
        ...prev,
        currentProgress: pct,
        progressHistory: [...prev.progressHistory, entry],
      }));
    },
    [updateData],
  );

  const submitPayroll = useCallback(
    (period: string, amount: number, by: string) => {
      const sub: PayrollSubmission = {
        id: Date.now().toString(),
        period,
        totalAmount: amount,
        status: "pending",
        submittedBy: by,
        submittedAt: new Date().toISOString().split("T")[0],
      };
      updateData((prev) => ({ ...prev, payroll: [...prev.payroll, sub] }));
    },
    [updateData],
  );

  const reviewPayroll = useCallback(
    (id: string, status: "approved" | "rejected", reviewer: string) => {
      updateData((prev) => ({
        ...prev,
        payroll: prev.payroll.map((p) =>
          p.id === id ? { ...p, status, reviewedBy: reviewer } : p,
        ),
      }));
    },
    [updateData],
  );

  const setBudget = useCallback(
    (amount: number) => {
      updateData((prev) => ({ ...prev, budget: amount }));
    },
    [updateData],
  );

  const addAuditEntry = useCallback(
    (entry: Omit<AuditEntry, "id" | "timestamp">) => {
      const full: AuditEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
      };
      updateData((prev) => ({ ...prev, auditLog: [full, ...prev.auditLog] }));
    },
    [updateData],
  );

  return (
    <ProjectDataContext.Provider
      value={{
        data,
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
