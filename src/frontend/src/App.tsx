import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./AuthContext";
import { ChatProvider } from "./ChatContext";
import { ProjectDataProvider } from "./ProjectDataContext";
import DemoPage from "./pages/DemoPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProjectsDashboard from "./pages/ProjectsDashboard";
import SignUpPage from "./pages/SignUpPage";
import UserManualPage from "./pages/UserManualPage";
import ChiefEngineerDashboard from "./pages/dashboards/ChiefEngineerDashboard";
import MaterialsEngineerDashboard from "./pages/dashboards/MaterialsEngineerDashboard";
import SiteEngineerDashboard from "./pages/dashboards/SiteEngineerDashboard";
import SiteOwnerDashboard from "./pages/dashboards/SiteOwnerDashboard";

const queryClient = new QueryClient();

function AppWithProjectData({ children }: { children: React.ReactNode }) {
  const { activeProject } = useAuth();
  return (
    <ProjectDataProvider projectId={activeProject?.id ?? null}>
      {children}
    </ProjectDataProvider>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <ChatProvider>
        <AppWithProjectData>
          <Outlet />
          <Toaster />
        </AppWithProjectData>
      </ChatProvider>
    </AuthProvider>
  ),
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) throw redirect({ to: "/" });
  return <>{children}</>;
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) throw redirect({ to: "/projects" });
  return <>{children}</>;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PublicGuard>
      <LoginPage />
    </PublicGuard>
  ),
});
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => (
    <PublicGuard>
      <SignUpPage />
    </PublicGuard>
  ),
});
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: () => (
    <AuthGuard>
      <ProjectsDashboard />
    </AuthGuard>
  ),
});
const userManualRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user-manual",
  component: UserManualPage,
});
const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoPage,
});
const siteEngineerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/site-engineer",
  component: () => (
    <AuthGuard>
      <SiteEngineerDashboard />
    </AuthGuard>
  ),
});
const chiefEngineerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/chief-engineer",
  component: () => (
    <AuthGuard>
      <ChiefEngineerDashboard />
    </AuthGuard>
  ),
});
const materialsEngineerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/materials-engineer",
  component: () => (
    <AuthGuard>
      <MaterialsEngineerDashboard />
    </AuthGuard>
  ),
});
const siteOwnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/site-owner",
  component: () => (
    <AuthGuard>
      <SiteOwnerDashboard />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  projectsRoute,
  userManualRoute,
  demoRoute,
  siteEngineerRoute,
  chiefEngineerRoute,
  materialsEngineerRoute,
  siteOwnerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
