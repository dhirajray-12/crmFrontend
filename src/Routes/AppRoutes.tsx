// frontend/src/Routes/AppRoutes.tsx - WITH ADVANCED LAZY LOADING
import React, { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminSuspended from "@/pages/Error/AdminSuspended";
import MaintenanceMode from "@/pages/Error/MaintenanceMode";
import { usePublicPlatformStatus } from "@/hooks/useBillingSuspension";
import { useAuthStore } from "@/Store/auth.store";

// Loading component with progress simulation
const PageLoader = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="client-theme-bg relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/18 blur-3xl" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/14 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-400/10 blur-3xl" />
      <div className="client-theme-surface-strong relative rounded-3xl border border-border px-8 py-7 text-center shadow-[0_22px_54px_rgba(2,6,23,0.36)]">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-accent/45 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-0 border-4 border-t-cyan-300 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="font-medium text-heading">Loading page...</p>
        <div className="w-48 h-1 bg-surface-strong/10 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-accent via-accent to-slate-200 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ✅ Preload hook for routes
const usePreloadRoute = () => {
  const preloadedRef = useRef<Set<string>>(new Set());

  const preload = useCallback((routeName: string, importer: () => Promise<any>) => {
    if (!preloadedRef.current.has(routeName)) {
      preloadedRef.current.add(routeName);
      importer();
    }
  }, []);

  return { preload };
};

// Lazy load route groups with proper chunk naming
const AuthRoutes = lazy(
  () =>
    import(
      /* webpackChunkName: "auth-routes", webpackPrefetch: true */ "./AuthRoutes"
    ),
);

const AdminRoutes = lazy(
  () =>
    import(
      /* webpackChunkName: "admin-routes", webpackPreload: true */ "./AdminRoutes"
    ),
);

const ClientRoutes = lazy(
  () =>
    import(
      /* webpackChunkName: "client-routes", webpackPreload: true */ "./ClientRoutes"
    ),
);

const SuperAdminRoutes = lazy(
  () =>
    import(/* webpackChunkName: "superadmin-routes" */ "./SuperAdminRoutes"),
);

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { preload } = usePreloadRoute();
  const { data: publicPlatformStatus, isLoading } = usePublicPlatformStatus();
  const userRole = useAuthStore((state) => state.user?.role);
  const activeRole = useAuthStore((state) => state.activeRole);
  const pathname = location.pathname;
  const isSuperadminArea = pathname.startsWith("/superadmin");
  const isSuperadminLogin = pathname === "/login/superadmin";
  const isAdminLogin = pathname === "/login/admin";
  const isAgentLogin = pathname === "/login/agent";
  const isSubadminLogin = pathname === "/login/subadmin";
  const isSuspended = publicPlatformStatus?.currentState?.isSuspended;
  const effectiveRole = userRole || activeRole;
  const isAdminContext =
    isAdminLogin ||
    isAgentLogin ||
    isSubadminLogin ||
    pathname.startsWith("/admin") ||
    effectiveRole === "admin" ||
    effectiveRole === "agent" ||
    effectiveRole === "subadmin";

  // Preload routes based on current path
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      preload(
        "admin",
        () => import(/* webpackChunkName: "admin-routes" */ "./AdminRoutes"),
      );
    } else if (location.pathname.startsWith("/client")) {
      preload(
        "client",
        () => import(/* webpackChunkName: "client-routes" */ "./ClientRoutes"),
      );
    } else if (location.pathname.startsWith("/superadmin")) {
      preload(
        "superadmin",
        () =>
          import(
            /* webpackChunkName: "superadmin-routes" */ "./SuperAdminRoutes"
          ),
      );
    }
  }, [location.pathname, preload]);

  if (
    !isLoading &&
    isSuspended &&
    !isSuperadminArea &&
    !isSuperadminLogin
  ) {
    if (isAdminContext) {
      return <AdminSuspended />;
    }

    return (
      <MaintenanceMode
        message={publicPlatformStatus?.currentState?.maintenanceMessage}
      />
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes with prefetch */}
        <Route path="/*" element={<AuthRoutes />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Client routes */}
        <Route path="/client/*" element={<ClientRoutes />} />

        {/* SuperAdmin routes */}
        <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
