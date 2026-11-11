// Routes/ProtectedRoutes.tsx - UPDATED
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";
import { getLoginRedirectByRole } from "@/utils/authRedirect";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Check if this is an impersonated session
  const hasImpersonationToken = !!sessionStorage.getItem("impersonation_active");

  // ✅ Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-body font-medium">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // If we have impersonation token, allow client routes only
  if (hasImpersonationToken) {
    // Only allow access to client routes during impersonation
    if (!allowedRoles.includes("client")) {
      return <Navigate to="/client/dashboard" replace />;
    }
    // Allow access to client routes
    return children ? <>{children}</> : <Outlet />;
  }

  // ❌ Not authenticated (cookie missing or invalid)
  if (!isAuthenticated || !user) {
    const attemptedRole = allowedRoles[0] ?? sessionStorage.getItem("active_role");

    return (
      <Navigate
        to={getLoginRedirectByRole(attemptedRole)}
        state={{ from: location }}
        replace
      />
    );
  }

  if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  // ✅ Authorized
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

const getDefaultRoute = (role: string) => {
  if (role === "superadmin") {
    return "/superadmin/configuration";
  }

  if (role === "agent") {
    return "/admin/Admin-customer-support";
  }

  if (role === "subadmin") {
    return "/admin/dashboard";
  }

  return `/${role}/dashboard`;
};
