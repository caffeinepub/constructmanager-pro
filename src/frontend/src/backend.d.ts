import type { Principal } from "@icp-sdk/core/principal";

export type AppRole =
  | "chiefEngineer"
  | "siteEngineer"
  | "materialsEngineer"
  | "siteOwner";

export type UserRole = "admin" | "user" | "guest";

export interface CanisterWorker {
  dailyWage: bigint;
  dialCode: string;
  id: bigint;
  name: string;
  phone: string;
  projectId: bigint;
  skill: string;
  wEmail: string;
}

export interface CanisterProject {
  budget: bigint;
  completion: bigint;
  createdBy: string;
  id: bigint;
  location: string;
  name: string;
  pwHash: string;
  startDate: string;
  teamCode: string;
}

export interface CanisterProjectMember {
  email: string;
  projectId: bigint;
  role: AppRole;
}

export interface CanisterProgressEntry {
  byEmail: string;
  date: string;
  id: bigint;
  notes: string;
  pct: bigint;
  photos: Array<string>;
  projectId: bigint;
}

export interface CanisterPayrollRecord {
  approvedBy: string;
  id: bigint;
  period: string;
  projectId: bigint;
  status: string;
  submittedBy: string;
  totalAmount: bigint;
}

export interface CanisterNotification {
  content: string;
  id: bigint;
  isRead: boolean;
  nType: string;
  timestamp: string;
  userEmail: string;
}

export interface CanisterMaterialTx {
  byEmail: string;
  date: string;
  id: bigint;
  materialId: bigint;
  notes: string;
  projectId: bigint;
  qty: bigint;
  txType: string;
}

export interface CanisterMaterial {
  id: bigint;
  name: string;
  priceUsd: bigint;
  projectId: bigint;
  reorderLevel: bigint;
  stock: bigint;
  supplier: string;
  unit: string;
}

export interface CanisterChatMessage {
  id: bigint;
  isDM: boolean;
  projectId: bigint;
  receiverEmail: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

export interface CanisterAuditEntry {
  action: string;
  area: string;
  details: string;
  id: bigint;
  timestamp: string;
  userEmail: string;
}

export interface CanisterAttendanceRecord {
  date: string;
  projectId: bigint;
  status: string;
  workerId: bigint;
}

export interface backendInterface {
  _initializeAccessControlWithSecret(secret: string): Promise<void>;
  addMaterial(
    email: string,
    projectId: bigint,
    name: string,
    unit: string,
    stock: bigint,
    reorderLevel: bigint,
    priceUsd: bigint,
    supplier: string,
    ts: string,
  ): Promise<{ materialId: bigint; message: string; ok: boolean }>;
  addProgress(
    email: string,
    projectId: bigint,
    pct: bigint,
    notes: string,
    date: string,
    photos: string[],
    ts: string,
  ): Promise<{ entryId: bigint; message: string; ok: boolean }>;
  addWorker(
    email: string,
    projectId: bigint,
    name: string,
    skill: string,
    dailyWage: bigint,
    phone: string,
    wEmail: string,
    dialCode: string,
    ts: string,
  ): Promise<{ message: string; ok: boolean; workerId: bigint }>;
  approvePayroll(
    email: string,
    projectId: bigint,
    payrollId: bigint,
    ts: string,
  ): Promise<{ message: string; ok: boolean }>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  changePassword(
    email: string,
    oldPw: string,
    newPw: string,
  ): Promise<{ message: string; ok: boolean }>;
  createProject(
    creatorEmail: string,
    name: string,
    location: string,
    startDate: string,
    teamCode: string,
    teamPassword: string,
    budget: bigint,
    ts: string,
  ): Promise<{ message: string; ok: boolean; projectId: bigint }>;
  getAllProjects(): Promise<CanisterProject[]>;
  getAttendance(projectId: bigint): Promise<CanisterAttendanceRecord[]>;
  getAuditLog(email: string, projectId: bigint): Promise<CanisterAuditEntry[]>;
  getCallerUserRole(): Promise<UserRole>;
  getDMChat(
    projectId: bigint,
    email1: string,
    email2: string,
  ): Promise<CanisterChatMessage[]>;
  getGroupChat(projectId: bigint): Promise<CanisterChatMessage[]>;
  getMaterialTx(projectId: bigint): Promise<CanisterMaterialTx[]>;
  getMaterials(projectId: bigint): Promise<CanisterMaterial[]>;
  getNotifications(email: string): Promise<CanisterNotification[]>;
  getPayroll(projectId: bigint): Promise<CanisterPayrollRecord[]>;
  getProgress(projectId: bigint): Promise<CanisterProgressEntry[]>;
  getProjectMembers(projectId: bigint): Promise<CanisterProjectMember[]>;
  getUserProjects(email: string): Promise<CanisterProject[]>;
  getWorkers(projectId: bigint): Promise<CanisterWorker[]>;
  isCallerAdmin(): Promise<boolean>;
  joinProject(
    email: string,
    teamCode: string,
    teamPassword: string,
    role: { [K in AppRole]?: null },
  ): Promise<{ message: string; ok: boolean; projectId: bigint }>;
  login(
    email: string,
    password: string,
  ): Promise<{
    currency: string;
    message: string;
    name: string;
    nationality: string;
    ok: boolean;
    phone: string;
    role: string;
  }>;
  markAllNotifsRead(email: string): Promise<{ ok: boolean }>;
  markAttendance(
    email: string,
    projectId: bigint,
    workerId: bigint,
    date: string,
    status: string,
  ): Promise<{ message: string; ok: boolean }>;
  markNotifRead(email: string, notifId: bigint): Promise<{ ok: boolean }>;
  postChat(
    projectId: bigint,
    senderEmail: string,
    senderName: string,
    senderRole: string,
    text: string,
    timestamp: string,
    isDM: boolean,
    receiverEmail: string,
  ): Promise<{ messageId: bigint; ok: boolean }>;
  recordTx(
    email: string,
    projectId: bigint,
    materialId: bigint,
    txType: string,
    qty: bigint,
    date: string,
    notes: string,
    ts: string,
  ): Promise<{ message: string; ok: boolean }>;
  register(
    email: string,
    name: string,
    password: string,
    nationality: string,
    currency: string,
    phone: string,
    role: { [K in AppRole]?: null },
  ): Promise<{ message: string; ok: boolean }>;
  seedDemo(): Promise<{ ok: boolean }>;
  submitPayroll(
    email: string,
    projectId: bigint,
    period: string,
    totalAmount: bigint,
    ts: string,
  ): Promise<{ message: string; ok: boolean; payrollId: bigint }>;
  updateMaterial(
    email: string,
    projectId: bigint,
    materialId: bigint,
    name: string,
    unit: string,
    stock: bigint,
    reorderLevel: bigint,
    priceUsd: bigint,
    supplier: string,
  ): Promise<{ message: string; ok: boolean }>;
  updateProfile(
    email: string,
    password: string,
    name: string,
    nationality: string,
    currency: string,
    phone: string,
  ): Promise<{ message: string; ok: boolean }>;
  updateTeamCode(
    email: string,
    projectId: bigint,
    newCode: string,
    newPassword: string,
  ): Promise<{ message: string; ok: boolean }>;
  updateWorker(
    email: string,
    projectId: bigint,
    workerId: bigint,
    name: string,
    skill: string,
    dailyWage: bigint,
    phone: string,
    wEmail: string,
    dialCode: string,
  ): Promise<{ message: string; ok: boolean }>;
  verifyProjectPassword(
    email: string,
    projectId: bigint,
    teamPassword: string,
  ): Promise<{ message: string; ok: boolean }>;
}
