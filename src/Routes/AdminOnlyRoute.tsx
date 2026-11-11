import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";

interface AdminOnlyRouteProps {
  children?: React.ReactNode;
}

// Unconditionally redirects subadmins away — for pages like Subadmin
// management that only full admins/superadmins may ever see.
const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "subadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminOnlyRoute;
