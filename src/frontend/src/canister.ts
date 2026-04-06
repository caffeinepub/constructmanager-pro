/**
 * canister.ts — Typed wrapper around the backend actor.
 * Converts number <-> bigint and handles errors gracefully.
 * The actor is obtained from the window-level actor singleton via createActorWithConfig.
 */

import type {
  AppRole,
  CanisterAttendanceRecord,
  CanisterAuditEntry,
  CanisterChatMessage,
  CanisterMaterial,
  CanisterMaterialTx,
  CanisterNotification,
  CanisterPayrollRecord,
  CanisterProgressEntry,
  CanisterProject,
  CanisterWorker,
} from "./backend";
import { createActorWithConfig } from "./config";

// ---- Canister singleton ----
let _actorPromise: ReturnType<typeof createActorWithConfig> | null = null;

function getActor() {
  if (!_actorPromise) {
    _actorPromise = createActorWithConfig();
  }
  return _actorPromise;
}

// ---- Seed demo ----
// Always call seedDemo on every app load — the Motoko function is idempotent:
// it checks if ce@demo.com already exists before inserting anything.
// This guarantees both draft and live deployments always have demo data,
// regardless of any previously stored localStorage flags.
export async function ensureDemoSeeded(): Promise<void> {
  try {
    const actor = await getActor();
    await actor.seedDemo();
  } catch {
    // silently ignore — demo seeding is best-effort
  }
}

// ---- Auth ----
export async function canisterLogin(email: string, password: string) {
  try {
    const actor = await getActor();
    const result = await actor.login(email, password);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Surface friendly message for common canister errors
    if (msg.includes("CANISTER_ID_BACKEND") || msg.includes("canister")) {
      throw new Error(
        "Backend service unavailable. Please try again in a moment.",
      );
    }
    throw new Error(msg || "Login failed");
  }
}

export async function canisterRegister(
  email: string,
  name: string,
  password: string,
  nationality: string,
  currency: string,
  phone: string,
  role: AppRole,
) {
  try {
    const actor = await getActor();
    const roleVariant: { [K in AppRole]?: null } = { [role]: null };
    return await actor.register(
      email,
      name,
      password,
      nationality,
      currency,
      phone,
      roleVariant,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("CANISTER_ID_BACKEND") || msg.includes("canister")) {
      throw new Error(
        "Backend service unavailable. Please try again in a moment.",
      );
    }
    throw new Error(msg || "Registration failed");
  }
}

export async function canisterChangePassword(
  email: string,
  oldPw: string,
  newPw: string,
) {
  const actor = await getActor();
  return actor.changePassword(email, oldPw, newPw);
}

export async function canisterUpdateProfile(
  email: string,
  password: string,
  name: string,
  nationality: string,
  currency: string,
  phone: string,
) {
  const actor = await getActor();
  return actor.updateProfile(
    email,
    password,
    name,
    nationality,
    currency,
    phone,
  );
}

// ---- Projects ----
export async function canisterGetUserProjects(
  email: string,
): Promise<CanisterProject[]> {
  const actor = await getActor();
  return actor.getUserProjects(email);
}

export async function canisterGetAllProjects(): Promise<CanisterProject[]> {
  const actor = await getActor();
  return actor.getAllProjects();
}

export async function canisterCreateProject(
  creatorEmail: string,
  name: string,
  location: string,
  startDate: string,
  teamCode: string,
  teamPassword: string,
  budget: number,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.createProject(
    creatorEmail,
    name,
    location,
    startDate,
    teamCode,
    teamPassword,
    BigInt(Math.round(budget)),
    ts,
  );
}

export async function canisterJoinProject(
  email: string,
  teamCode: string,
  teamPassword: string,
  role: AppRole,
) {
  const actor = await getActor();
  const roleVariant: { [K in AppRole]?: null } = { [role]: null };
  return actor.joinProject(email, teamCode, teamPassword, roleVariant);
}

export async function canisterVerifyProjectPassword(
  email: string,
  projectId: number,
  teamPassword: string,
) {
  const actor = await getActor();
  return actor.verifyProjectPassword(email, BigInt(projectId), teamPassword);
}

export async function canisterUpdateTeamCode(
  email: string,
  projectId: number,
  newCode: string,
  newPassword: string,
) {
  const actor = await getActor();
  return actor.updateTeamCode(email, BigInt(projectId), newCode, newPassword);
}

export async function canisterGetProjectMembers(projectId: number) {
  const actor = await getActor();
  return actor.getProjectMembers(BigInt(projectId));
}

// ---- Workers ----
export async function canisterGetWorkers(
  projectId: number,
): Promise<CanisterWorker[]> {
  const actor = await getActor();
  return actor.getWorkers(BigInt(projectId));
}

export async function canisterAddWorker(
  email: string,
  projectId: number,
  name: string,
  skill: string,
  dailyWage: number,
  phone: string,
  wEmail: string,
  dialCode: string,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.addWorker(
    email,
    BigInt(projectId),
    name,
    skill,
    BigInt(Math.round(dailyWage)),
    phone,
    wEmail,
    dialCode,
    ts,
  );
}

export async function canisterUpdateWorker(
  email: string,
  projectId: number,
  workerId: number,
  name: string,
  skill: string,
  dailyWage: number,
  phone: string,
  wEmail: string,
  dialCode: string,
) {
  const actor = await getActor();
  return actor.updateWorker(
    email,
    BigInt(projectId),
    BigInt(workerId),
    name,
    skill,
    BigInt(Math.round(dailyWage)),
    phone,
    wEmail,
    dialCode,
  );
}

// ---- Attendance ----
export async function canisterGetAttendance(
  projectId: number,
): Promise<CanisterAttendanceRecord[]> {
  const actor = await getActor();
  return actor.getAttendance(BigInt(projectId));
}

export async function canisterMarkAttendance(
  email: string,
  projectId: number,
  workerId: number,
  date: string,
  status: string,
) {
  const actor = await getActor();
  return actor.markAttendance(
    email,
    BigInt(projectId),
    BigInt(workerId),
    date,
    status,
  );
}

// ---- Materials ----
export async function canisterGetMaterials(
  projectId: number,
): Promise<CanisterMaterial[]> {
  const actor = await getActor();
  return actor.getMaterials(BigInt(projectId));
}

export async function canisterAddMaterial(
  email: string,
  projectId: number,
  name: string,
  unit: string,
  stock: number,
  reorderLevel: number,
  priceUsd: number,
  supplier: string,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.addMaterial(
    email,
    BigInt(projectId),
    name,
    unit,
    BigInt(Math.round(stock)),
    BigInt(Math.round(reorderLevel)),
    BigInt(Math.round(priceUsd)),
    supplier,
    ts,
  );
}

export async function canisterUpdateMaterial(
  email: string,
  projectId: number,
  materialId: number,
  name: string,
  unit: string,
  stock: number,
  reorderLevel: number,
  priceUsd: number,
  supplier: string,
) {
  const actor = await getActor();
  return actor.updateMaterial(
    email,
    BigInt(projectId),
    BigInt(materialId),
    name,
    unit,
    BigInt(Math.round(stock)),
    BigInt(Math.round(reorderLevel)),
    BigInt(Math.round(priceUsd)),
    supplier,
  );
}

export async function canisterGetMaterialTx(
  projectId: number,
): Promise<CanisterMaterialTx[]> {
  const actor = await getActor();
  return actor.getMaterialTx(BigInt(projectId));
}

export async function canisterRecordTx(
  email: string,
  projectId: number,
  materialId: number,
  txType: string,
  qty: number,
  date: string,
  notes: string,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.recordTx(
    email,
    BigInt(projectId),
    BigInt(materialId),
    txType,
    BigInt(Math.round(qty)),
    date,
    notes,
    ts,
  );
}

// ---- Progress ----
export async function canisterGetProgress(
  projectId: number,
): Promise<CanisterProgressEntry[]> {
  const actor = await getActor();
  return actor.getProgress(BigInt(projectId));
}

export async function canisterAddProgress(
  email: string,
  projectId: number,
  pct: number,
  notes: string,
  date: string,
  photos: string[],
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.addProgress(
    email,
    BigInt(projectId),
    BigInt(Math.round(pct)),
    notes,
    date,
    photos,
    ts,
  );
}

// ---- Payroll ----
export async function canisterGetPayroll(
  projectId: number,
): Promise<CanisterPayrollRecord[]> {
  const actor = await getActor();
  return actor.getPayroll(BigInt(projectId));
}

export async function canisterSubmitPayroll(
  email: string,
  projectId: number,
  period: string,
  totalAmount: number,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.submitPayroll(
    email,
    BigInt(projectId),
    period,
    BigInt(Math.round(totalAmount)),
    ts,
  );
}

export async function canisterApprovePayroll(
  email: string,
  projectId: number,
  payrollId: number,
) {
  const actor = await getActor();
  const ts = new Date().toISOString();
  return actor.approvePayroll(email, BigInt(projectId), BigInt(payrollId), ts);
}

// ---- Audit Log ----
export async function canisterGetAuditLog(
  email: string,
  projectId: number,
): Promise<CanisterAuditEntry[]> {
  const actor = await getActor();
  return actor.getAuditLog(email, BigInt(projectId));
}

// ---- Chat ----
export async function canisterGetGroupChat(
  projectId: number,
): Promise<CanisterChatMessage[]> {
  const actor = await getActor();
  return actor.getGroupChat(BigInt(projectId));
}

export async function canisterGetDMChat(
  projectId: number,
  email1: string,
  email2: string,
): Promise<CanisterChatMessage[]> {
  const actor = await getActor();
  return actor.getDMChat(BigInt(projectId), email1, email2);
}

export async function canisterPostChat(
  projectId: number,
  senderEmail: string,
  senderName: string,
  senderRole: string,
  text: string,
  isDM: boolean,
  receiverEmail: string,
) {
  const actor = await getActor();
  const timestamp = new Date().toISOString();
  return actor.postChat(
    BigInt(projectId),
    senderEmail,
    senderName,
    senderRole,
    text,
    timestamp,
    isDM,
    receiverEmail,
  );
}

// ---- Notifications ----
export async function canisterGetNotifications(
  email: string,
): Promise<CanisterNotification[]> {
  const actor = await getActor();
  return actor.getNotifications(email);
}

export async function canisterMarkNotifRead(email: string, notifId: number) {
  const actor = await getActor();
  return actor.markNotifRead(email, BigInt(notifId));
}

export async function canisterMarkAllNotifsRead(email: string) {
  const actor = await getActor();
  return actor.markAllNotifsRead(email);
}
