import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  canisterChangePassword,
  canisterLogin,
  canisterRegister,
  ensureDemoSeeded,
} from "./canister";
import { loadLiveRates } from "./utils/currency";

export type UserRole =
  | "siteOwner"
  | "chiefEngineer"
  | "materialsEngineer"
  | "siteEngineer";

export interface ProjectMember {
  email: string;
  name: string;
  role: UserRole;
}

export interface Project {
  id: string; // numeric string from canister
  name: string;
  description: string;
  teamCode: string;
  teamPassword: string;
  status: "Active" | "On Hold" | "Completed";
  budget: number;
  location: string;
  members: ProjectMember[];
}

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  nationality?: string;
  currency?: string;
  phone?: string;
}

const AUTH_STORAGE_KEY = "constructmanager_user_v5";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  activeProject: Project | null;
  cachedCodes: Map<string, boolean>; // projectId -> verified
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    nationality?: string,
    currency?: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
  enterProject: (projectId: string, teamPassword: string) => Promise<boolean>;
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProjectCredentials: (
    projectId: string,
    teamCode: string,
    teamPassword: string,
  ) => void;
  updateProjectInfo: (
    projectId: string,
    name: string,
    location: string,
  ) => void;
  joinProject: (
    teamCode: string,
    teamPassword: string,
    role: UserRole,
  ) => Promise<{ ok: boolean; projectId: string; message: string }>;
  addMemberToProject: (projectId: string, member: ProjectMember) => void;
  removeMemberFromProject: (projectId: string, email: string) => void;
  changePassword: (current: string, newPass: string) => Promise<void>;
  resetMemberPassword: (memberEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleToDashboardPath(role: UserRole): string {
  switch (role) {
    case "chiefEngineer":
      return "/dashboard/chief-engineer";
    case "siteOwner":
      return "/dashboard/site-owner";
    case "siteEngineer":
      return "/dashboard/site-engineer";
    case "materialsEngineer":
      return "/dashboard/materials-engineer";
  }
}

export function roleToLabel(role: string): string {
  switch (role) {
    case "siteOwner":
      return "Site Owner";
    case "chiefEngineer":
      return "Chief Engineer";
    case "materialsEngineer":
      return "Materials Engineer";
    case "siteEngineer":
      return "Site Engineer";
    default:
      return "User";
  }
}

export function isAdminRole(role: UserRole): boolean {
  return role === "chiefEngineer";
}

function mapRoleString(roleStr: string): UserRole {
  if (
    roleStr === "chiefEngineer" ||
    roleStr === "siteEngineer" ||
    roleStr === "materialsEngineer" ||
    roleStr === "siteOwner"
  ) {
    return roleStr as UserRole;
  }
  return "siteEngineer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  // Map from projectId -> verified (canister-verified password)
  const [cachedCodes] = useState<Map<string, boolean>>(new Map());
  const setUserRef = useRef(setUser);
  setUserRef.current = setUser;

  // Restore auth from localStorage on mount, seed demo data, and load live exchange rates
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
      // Run seed + exchange rates in parallel — neither blocks the other
      await Promise.all([ensureDemoSeeded(), loadLiveRates()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const emailLower = email.toLowerCase().trim();
    const result = await canisterLogin(emailLower, password);
    if (!result.ok) {
      throw new Error(
        result.message || "Login failed. Check your email and password.",
      );
    }
    const authUser: AuthUser = {
      name: result.name,
      email: emailLower,
      role: mapRoleString(result.role),
      nationality: result.nationality || undefined,
      currency: result.currency || undefined,
      phone: result.phone || undefined,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setUserRef.current(authUser);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      nationality?: string,
      currency?: string,
      phone?: string,
    ) => {
      const emailLower = email.toLowerCase().trim();
      const result = await canisterRegister(
        emailLower,
        name.trim(),
        password,
        nationality ?? "",
        currency ?? "",
        phone ?? "",
        role,
      );
      if (!result.ok) {
        throw new Error(result.message || "Registration failed.");
      }
      // Auto-login after registration
      const loginResult = await canisterLogin(emailLower, password);
      const authUser: AuthUser = {
        name: name.trim(),
        email: emailLower,
        role,
        nationality,
        currency,
        phone,
      };
      if (loginResult.ok) {
        authUser.name = loginResult.name || name.trim();
        authUser.nationality = loginResult.nationality || nationality;
        authUser.currency = loginResult.currency || currency;
        authUser.phone = loginResult.phone || phone;
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUserRef.current(authUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setActiveProjectState(null);
    setProjects([]);
    cachedCodes.clear();
  }, [cachedCodes]);

  const enterProject = useCallback(
    async (projectId: string, teamPassword: string): Promise<boolean> => {
      const project = projects.find((p) => p.id === projectId) ?? null;
      if (!project) return false;
      // Always verify against canister
      try {
        const { canisterVerifyProjectPassword } = await import("./canister");
        const result = await canisterVerifyProjectPassword(
          user?.email ?? "",
          Number(projectId),
          teamPassword,
        );
        if (result.ok) {
          cachedCodes.set(projectId, true);
          setActiveProjectState(project);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [projects, cachedCodes, user],
  );

  const setActiveProject = useCallback((project: Project | null) => {
    setActiveProjectState(project);
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project]);
  }, []);

  const updateProjectCredentials = useCallback(
    (projectId: string, teamCode: string, teamPassword: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, teamCode, teamPassword } : p,
        ),
      );
      cachedCodes.delete(projectId);
      setActiveProjectState((prev) =>
        prev?.id === projectId ? { ...prev, teamCode, teamPassword } : prev,
      );
    },
    [cachedCodes],
  );

  const updateProjectInfo = useCallback(
    (projectId: string, name: string, location: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, name, location } : p)),
      );
      setActiveProjectState((prev) =>
        prev?.id === projectId ? { ...prev, name, location } : prev,
      );
    },
    [],
  );

  const joinProject = useCallback(
    async (teamCode: string, teamPassword: string, role: UserRole) => {
      try {
        const { canisterJoinProject } = await import("./canister");
        const result = await canisterJoinProject(
          user?.email ?? "",
          teamCode,
          teamPassword,
          role,
        );
        return {
          ok: result.ok,
          projectId: String(Number(result.projectId)),
          message: result.message,
        };
      } catch (e) {
        return { ok: false, projectId: "", message: String(e) };
      }
    },
    [user],
  );

  const addMemberToProject = useCallback(
    (projectId: string, member: ProjectMember) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (p.members.some((m) => m.email === member.email)) return p;
          return { ...p, members: [...p.members, member] };
        }),
      );
    },
    [],
  );

  const removeMemberFromProject = useCallback(
    (projectId: string, email: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, members: p.members.filter((m) => m.email !== email) }
            : p,
        ),
      );
    },
    [],
  );

  const resetMemberPassword = useCallback(async (_memberEmail: string) => {
    // Password reset requires the member's current password for verification.
    // Direct admin password override is not supported via the canister API.
    // Ask the member to use the Change Password option in their profile settings.
    throw new Error(
      "To reset a member's password, ask them to use 'Change Password' in their profile settings.",
    );
  }, []);

  const changePassword = useCallback(
    async (current: string, newPass: string) => {
      if (!user) throw new Error("Not logged in");
      const result = await canisterChangePassword(user.email, current, newPass);
      if (!result.ok)
        throw new Error(result.message || "Password change failed");
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        projects,
        setProjects,
        activeProject,
        cachedCodes,
        login,
        register,
        logout,
        enterProject,
        setActiveProject,
        addProject,
        updateProjectCredentials,
        updateProjectInfo,
        joinProject,
        addMemberToProject,
        removeMemberFromProject,
        changePassword,
        resetMemberPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
