import { Eye, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/API/axiosInstance";

export const AdminImpersonationBanner = () => {
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null);

  useEffect(() => {
    // Check if we have active impersonation from admin side
    const impersonationData = localStorage.getItem("impersonation_data");
    if (impersonationData) {
      try {
        const { user } = JSON.parse(impersonationData);
        setImpersonatedUser(user);
      } catch (error) {
        console.error("Error parsing impersonation data:", error);
      }
    }

    // Listen for storage events to detect when impersonation ends
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "impersonation_data" && !e.newValue) {
        setImpersonatedUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleStopImpersonation = async () => {
    try {
      // Clears the httpOnly auth_token_client cookie server-side - it's
      // shared across tabs for this origin, so this ends the impersonated
      // session wherever it's open, not just in this tab.
      await api.post(
        "/auth/logout",
        {},
        { headers: { "x-active-role": "client" } },
      );
    } catch (error) {
      console.error("Failed to end impersonation session:", error);
    }

    // Clear impersonation data
    localStorage.removeItem("impersonation_data");
    sessionStorage.removeItem("impersonation_active");
    sessionStorage.removeItem("active_role");

    // Close the client tab if it's open
    // Note: You can't directly close another tab, but you can notify it
    sessionStorage.setItem("impersonation_ended", "true");

    // Refresh current page to clear impersonation state
    window.location.reload();
  };

  if (!impersonatedUser) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Impersonation Active</strong> - You are viewing as{" "}
                {impersonatedUser.firstname} {impersonatedUser.lastname}
              </p>
            </div>
          </div>
          <button
            onClick={handleStopImpersonation}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-heading rounded-md transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Stop Impersonation
          </button>
        </div>
      </div>
    </div>
  );
};
