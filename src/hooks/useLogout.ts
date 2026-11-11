// NEW file
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";
import { useToastStore } from "@/Store/toast.store";
import { getLoginRedirectByRole } from "@/utils/authRedirect";

const logoutUser = async (): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-active-role": sessionStorage.getItem("active_role") || "",
      },
      credentials: "include", // ✅ For cookies
    },
  );

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout, activeRole, user } = useAuthStore();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      const logoutRole =
        sessionStorage.getItem("active_role") || activeRole || user?.role;

      logout();
      addToast("success", "Logged out successfully");
      navigate(getLoginRedirectByRole(logoutRole), { replace: true });
    },
    onError: (error: any) => {
      const logoutRole =
        sessionStorage.getItem("active_role") || activeRole || user?.role;

      logout(); // Still clear local state
      addToast("error", error.message || "Logout failed");
      navigate(getLoginRedirectByRole(logoutRole), { replace: true });
    },
  });
};
