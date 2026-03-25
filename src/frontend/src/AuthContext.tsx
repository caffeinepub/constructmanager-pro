import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole =
  | "siteOwner"
  | "chiefEngineer"
  | "materialsEngineer"
  | "siteEngineer";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

// Hardcoded credentials per role
export const ROLE_CREDENTIALS: Record<
  UserRole,
  { email: string; password: string; name: string }
> = {
  siteOwner: {
    email: "siteowner@constructmanager.com",
    password: "SiteOwner@123",
    name: "Site Owner",
  },
  chiefEngineer: {
    email: "chiefengineer@constructmanager.com",
    password: "ChiefEng@123",
    name: "Chief Engineer",
  },
  materialsEngineer: {
    email: "materials@constructmanager.com",
    password: "MatEng@123",
    name: "Materials Engineer",
  },
  siteEngineer: {
    email: "siteengineer@constructmanager.com",
    password: "SiteEng@123",
    name: "Site Engineer",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "constructmanager_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleToDashboardPath(role: UserRole): string {
  switch (role) {
    case "siteOwner":
      return "/dashboard/site-owner";
    case "chiefEngineer":
      return "/dashboard/chief-engineer";
    case "materialsEngineer":
      return "/dashboard/materials-engineer";
    case "siteEngineer":
      return "/dashboard/site-engineer";
    default:
      return "/dashboard/site-engineer";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const entry = Object.entries(ROLE_CREDENTIALS).find(
      ([, creds]) =>
        creds.email.toLowerCase() === email.toLowerCase() &&
        creds.password === password,
    );
    if (!entry) throw new Error("Invalid email or password.");
    const [role, creds] = entry;
    const authUser: AuthUser = {
      name: creds.name,
      email: creds.email,
      role: role as UserRole,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const register = useCallback(
    async (name: string, _email: string, _password: string, role: UserRole) => {
      // For open credentials model, registration just logs in with the role credentials
      const creds = ROLE_CREDENTIALS[role];
      const authUser: AuthUser = {
        name: name || creds.name,
        email: creds.email,
        role,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
