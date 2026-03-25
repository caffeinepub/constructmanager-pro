import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Material {
    name: string;
    quantity: bigint;
    reorderLevel: bigint;
}
export interface User {
    name: string;
    role: UserRole;
    email: string;
    hashedPassword: string;
}
export interface Task {
    status: string;
    title: string;
    assignedTo: Principal;
    description: string;
}
export interface Project {
    status: string;
    name: string;
    site: string;
    budget: bigint;
}
export interface DashboardSummary {
    teamList: Array<User>;
    projects: Array<Project>;
    attendanceSummary: bigint;
    financialOverview: bigint;
}
export enum UserRole {
    siteOwner = "siteOwner",
    materialsEngineer = "materialsEngineer",
    chiefEngineer = "chiefEngineer",
    siteEngineer = "siteEngineer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMaterial(name: string, quantity: bigint, reorderLevel: bigint): Promise<bigint>;
    addProject(name: string, site: string, status: string, budget: bigint): Promise<bigint>;
    approveMaterialRequest(materialName: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignTask(title: string, description: string, assignedTo: Principal, status: string): Promise<bigint>;
    createReorderAlert(materialId: bigint, reorderLevel: bigint): Promise<void>;
    getAllUsers(): Promise<Array<[Principal, User]>>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCurrentUserProfile(): Promise<User>;
    getFullDashboardSummary(): Promise<DashboardSummary>;
    getInventory(): Promise<Array<Material>>;
    getProjectOverview(): Promise<Array<Project>>;
    getSiteEngineerTasks(siteEngineer: Principal): Promise<Array<Task>>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(email: string, password: string): Promise<void>;
    registerUser(name: string, email: string, password: string, role: UserRole): Promise<void>;
    submitDailyLog(date: bigint, content: string): Promise<void>;
    updateStock(materialId: bigint, quantity: bigint): Promise<void>;
}
