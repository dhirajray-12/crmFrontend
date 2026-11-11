import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useHasPermission } from "@/hooks/useHasPermission";
import type { PermissionKey } from "@/Constants/permissions";

interface PermissionRouteProps {
  permission: PermissionKey | string;
  children?: React.ReactNode;
}

// UX layer only — the backend (authorizePermission middleware) is the
// authoritative permission boundary. This just keeps subadmins from
// landing on pages their permission set doesn't cover.
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permission,
  children,
}) => {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PermissionRoute;
