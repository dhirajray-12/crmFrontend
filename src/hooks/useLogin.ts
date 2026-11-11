// frontend/src/hooks/useLogin.ts - UPDATED
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";
import { useToastStore } from "@/Store/toast.store";
import type { LoginCredentials, LoginResponse } from "@/types/auth.types";
import { getDeviceId, getDeviceName } from "@/utils/deviceIdentity";
import {
  requestLoginLocation,
  type LoginLocationContext,
} from "@/utils/loginLocation";

const LOGIN_LOCATION_WAIT_MS = 150;
const LOGIN_LOCATION_TIMEOUT_CONTEXT: LoginLocationContext = {
  permission: "timeout",
  source: "ip",
};

const preloadPostLoginDestination = async (role: string) => {
  if (role === "superadmin") {
    await Promise.all([
      import("@/Routes/SuperAdminRoutes"),
      import("@/pages/SuperAdminpage/SidebarPages/Configuration"),
    ]);
    return;
  }

  if (role === "admin") {
    await Promise.all([
      import("@/Routes/AdminRoutes"),
      import("@/pages/Adminpage/AdminDashboard"),
    ]);
    return;
  }

  if (role === "agent") {
    await Promise.all([
      import("@/Routes/AdminRoutes"),
      import("@/pages/Adminpage/AdminPages/AdminCustomerSupport"),
    ]);
    return;
  }

  if (role === "subadmin") {
    await Promise.all([
      import("@/Routes/AdminRoutes"),
      import("@/pages/Adminpage/AdminDashboard"),
    ]);
    return;
  }

  await Promise.all([
    import("@/Routes/ClientRoutes"),
    import("@/pages/ClientPage/Dashboard"),
  ]);
};

const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const locationContext = await Promise.race([
    requestLoginLocation(),
    new Promise<LoginLocationContext>((resolve) => {
      window.setTimeout(() => resolve(LOGIN_LOCATION_TIMEOUT_CONTEXT), LOGIN_LOCATION_WAIT_MS);
    }),
  ]);
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-active-role": sessionStorage.getItem("active_role") || "",
        "x-device-id": getDeviceId(),
        "x-device-name": getDeviceName(),
      },
      body: JSON.stringify({
        ...credentials,
        locationContext,
      }),
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Update global auth state - this will trigger all subscribers
      setAuth(data.user);
      
      // Show success message
      addToast("success", "Login successful!");
      
      // Invalidate any user-specific queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["myAccountsList"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      // Navigate based on role
      const role = data.user.role;
      preloadPostLoginDestination(role)
        .catch((error) => {
          console.error("Failed to preload post-login destination:", error);
        })
        .finally(() => {
          startTransition(() => {
            if (role === "superadmin") {
              navigate("/superadmin/configuration");
            } else if (role === "admin") {
              navigate("/admin/dashboard");
            } else if (role === "agent") {
              navigate("/admin/Admin-customer-support");
            } else if (role === "subadmin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/client/dashboard");
            }
          });
        });
    },
    onError: (error: any) => {
      console.error("Login error:", error.message);
      addToast("error", error.message || "Login failed");
    },
  });
};

export { preloadPostLoginDestination };
