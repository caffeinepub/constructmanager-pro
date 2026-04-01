import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
  id: string;
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

const DEMO_USERS: Array<{
  email: string;
  password: string;
  name: string;
  role: UserRole;
}> = [
  {
    email: "ce@demo.com",
    password: "ChiefEng@123",
    name: "Arjun Ramesh",
    role: "chiefEngineer",
  },
  {
    email: "so@demo.com",
    password: "SiteOwner@123",
    name: "Suresh Kumar",
    role: "siteOwner",
  },
  {
    email: "se@demo.com",
    password: "SiteEng@123",
    name: "Priya Nair",
    role: "siteEngineer",
  },
  {
    email: "me@demo.com",
    password: "MatEng@123",
    name: "Dinesh Babu",
    role: "materialsEngineer",
  },
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: "alpha",
    name: "Project Alpha",
    description: "Greenfield Residential Block A – Chennai North",
    teamCode: "ALPHA42",
    teamPassword: "alpha@pass",
    status: "Active",
    budget: 5000000,
    location: "Chennai North",
    members: [
      { email: "ce@demo.com", name: "Arjun Ramesh", role: "chiefEngineer" },
      { email: "so@demo.com", name: "Suresh Kumar", role: "siteOwner" },
      { email: "se@demo.com", name: "Priya Nair", role: "siteEngineer" },
      { email: "me@demo.com", name: "Dinesh Babu", role: "materialsEngineer" },
    ],
  },
  {
    id: "beta",
    name: "Site Beta",
    description: "Commercial Plaza Foundation – Anna Nagar",
    teamCode: "BETA56",
    teamPassword: "beta@pass",
    status: "Active",
    budget: 12000000,
    location: "Anna Nagar",
    members: [
      { email: "ce@demo.com", name: "Arjun Ramesh", role: "chiefEngineer" },
      { email: "se@demo.com", name: "Priya Nair", role: "siteEngineer" },
      { email: "me@demo.com", name: "Dinesh Babu", role: "materialsEngineer" },
    ],
  },
  {
    id: "tower",
    name: "Tower C",
    description: "Highway Overpass Section 3 – Tambaram",
    teamCode: "TOWER99",
    teamPassword: "tower@pass",
    status: "On Hold",
    budget: 8500000,
    location: "Tambaram",
    members: [
      { email: "ce@demo.com", name: "Arjun Ramesh", role: "chiefEngineer" },
      { email: "so@demo.com", name: "Suresh Kumar", role: "siteOwner" },
    ],
  },
];

const PROJECTS_STORAGE_KEY = "constructmanager_projects_v2";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  projects: Project[];
  activeProject: Project | null;
  cachedCodes: Map<string, string>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    nationality?: string,
    currency?: string,
  ) => Promise<void>;
  logout: () => void;
  enterProject: (projectId: string, teamCode: string) => boolean;
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, "id">) => void;
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
  joinProject: (teamCode: string) => boolean;
  addMemberToProject: (projectId: string, member: ProjectMember) => void;
  removeMemberFromProject: (projectId: string, email: string) => void;
  changePassword: (current: string, newPass: string) => Promise<void>;
  resetMemberPassword: (memberEmail: string) => Promise<void>;
}

const AUTH_STORAGE_KEY = "constructmanager_user_v4";

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

function loadProjectsFromStorage(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) return DEMO_PROJECTS;
    const parsed: Project[] = JSON.parse(stored);
    const map = new Map<string, Project>();
    for (const p of DEMO_PROJECTS) map.set(p.id, p);
    for (const p of parsed) map.set(p.id, p);
    return Array.from(map.values());
  } catch {
    return DEMO_PROJECTS;
  }
}

export function isAdminRole(role: UserRole): boolean {
  return role === "chiefEngineer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>(() =>
    loadProjectsFromStorage(),
  );
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [cachedCodes] = useState<Map<string, string>>(new Map());
  const setUserRef = useRef(setUser);
  setUserRef.current = setUser;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      /* ignore */
    }
  }, [projects]);

  const login = useCallback(async (email: string, password: string) => {
    const emailLower = email.toLowerCase();
    const demo = DEMO_USERS.find(
      (u) => u.email === emailLower && u.password === password,
    );
    if (demo) {
      const authUser: AuthUser = {
        name: demo.name,
        email: emailLower,
        role: demo.role,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUserRef.current(authUser);
      return;
    }
    const storedReg = localStorage.getItem("constructmanager_registrations");
    const registrations: Record<
      string,
      { name: string; role: UserRole; password: string }
    > = storedReg ? JSON.parse(storedReg) : {};
    const reg = registrations[emailLower];
    if (!reg) throw new Error("No account found. Please sign up first.");
    if (reg.password !== password) throw new Error("Incorrect password.");
    const authUser: AuthUser = {
      name: reg.name,
      email: emailLower,
      role: reg.role,
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
    ) => {
      const emailLower = email.toLowerCase();
      const storedReg = localStorage.getItem("constructmanager_registrations");
      const registrations: Record<
        string,
        {
          name: string;
          role: UserRole;
          password: string;
          nationality?: string;
          currency?: string;
        }
      > = storedReg ? JSON.parse(storedReg) : {};
      registrations[emailLower] = {
        name,
        role,
        password,
        nationality,
        currency,
      };
      localStorage.setItem(
        "constructmanager_registrations",
        JSON.stringify(registrations),
      );
      const authUser: AuthUser = {
        name,
        email: emailLower,
        role,
        nationality,
        currency,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUserRef.current(authUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setActiveProjectState(null);
    cachedCodes.clear();
  }, [cachedCodes]);

  const enterProject = useCallback(
    (projectId: string, teamCode: string) => {
      const project = projects.find((p) => p.id === projectId) ?? null;
      if (!project) return false;
      if (project.teamCode.toUpperCase() !== teamCode.toUpperCase())
        return false;
      cachedCodes.set(projectId, teamCode);
      setActiveProjectState(project);
      return true;
    },
    [projects, cachedCodes],
  );

  const setActiveProject = useCallback((project: Project | null) => {
    setActiveProjectState(project);
  }, []);

  const addProject = useCallback((projectData: Omit<Project, "id">) => {
    const newProject: Project = { ...projectData, id: Date.now().toString() };
    setProjects((prev) => [...prev, newProject]);
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
    (teamCode: string) => {
      const project = projects.find(
        (p) => p.teamCode.toUpperCase() === teamCode.toUpperCase(),
      );
      if (!project) return false;
      cachedCodes.set(project.id, teamCode);
      setActiveProjectState(project);
      return true;
    },
    [projects, cachedCodes],
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
    await new Promise((r) => setTimeout(r, 300));
  }, []);

  const changePassword = useCallback(
    async (_current: string, _newPass: string) => {
      await new Promise((r) => setTimeout(r, 300));
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        projects,
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
