import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";
import { getLoginRedirectByRole } from "@/utils/authRedirect";

export default function Logout() {
  const { logout, activeRole, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const logoutRole =
      sessionStorage.getItem("active_role") || activeRole || user?.role;
    const redirectPath = getLoginRedirectByRole(logoutRole);

    // Call logout which handles clearing auth and navigation
    logout();

    // Fallback: if logout doesn't navigate (shouldn't happen), redirect after a short delay
    const timer = setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeRole, logout, navigate, user?.role]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-strong">
      <p className="text-body">Logging out...</p>
    </div>
  );
}
