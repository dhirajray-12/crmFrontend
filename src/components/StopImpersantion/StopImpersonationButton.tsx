// components/ImpersonationBanner.tsx
import { useAuthStore } from "@/Store/auth.store";
import { AlertTriangle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/API/axiosInstance";

export const ImpersonationBanner = () => {
  const navigate = useNavigate();
  const hasImpersonationToken = !!sessionStorage.getItem("impersonation_active");
  const { user } = useAuthStore();
  const handleStopImpersonation = async () => {
    try {
      // Clears the httpOnly auth_token_client cookie server-side.
      await api.post(
        "/auth/logout",
        {},
        { headers: { "x-active-role": "client" } },
      );
    } catch (error) {
      console.error("Failed to end impersonation session:", error);
    }

    try {
      // Clear impersonation data
      sessionStorage.removeItem("impersonation_active");
      sessionStorage.removeItem("active_role");
      localStorage.removeItem("impersonation_data");
      window.close(); // Attempt to close the tab (may not work in all browsers)

      // Redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      window.location.href = "/admin/dashboard";
    }
  };

  if (!hasImpersonationToken) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                You are currently impersonating{" "}
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>
              </p>
              <p className="text-xs text-yellow-700">
                Any actions you take will be performed as this user
              </p>
            </div>
          </div>
          <button
            onClick={handleStopImpersonation}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-heading rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Stop Impersonating
          </button>
        </div>
      </div>
    </div>
  );
};
