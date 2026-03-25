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
import { AuthProvider, roleToDashboardPath, useAuth } from "./AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChiefEngineerDashboard from "./pages/dashboards/ChiefEngineerDashboard";
import MaterialsEngineerDashboard from "./pages/dashboards/MaterialsEngineerDashboard";
import SiteEngineerDashboard from "./pages/dashboards/SiteEngineerDashboard";
import SiteOwnerDashboard from "./pages/dashboards/SiteOwnerDashboard";

const queryClient = new QueryClient();

// Root route wraps everything in providers
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  ),
});

// Guard wrappers
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-[#F28C2A] border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) {
    throw redirect({ to: "/login" });
  }
  return <>{children}</>;
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) {
    throw redirect({ to: roleToDashboardPath(user.role) });
  }
  return <>{children}</>;
}

// Routes
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
