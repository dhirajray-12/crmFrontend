// components/ImpersonationHandler.tsx
import { useEffect } from "react";
import { useAuthStore } from "@/Store/auth.store";

export const ImpersonationHandler = () => {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Check if this is an impersonation session
    const urlParams = new URLSearchParams(window.location.search);
    const isImpersonating = urlParams.get("impersonating") === "true";

    if (isImpersonating) {
      // Get impersonation data from localStorage
      const impersonationData = localStorage.getItem("impersonation_data");

      if (impersonationData) {
        try {
          const { user } = JSON.parse(impersonationData);
          const normalizedUser = user?.user ?? user;
          const normalizedId =
            normalizedUser?._id ?? normalizedUser?.id ?? "";
          const normalizedFirstName =
            normalizedUser?.firstName ?? normalizedUser?.firstname ?? "";
          const normalizedLastName =
            normalizedUser?.lastName ?? normalizedUser?.lastname ?? "";

          // The auth_token_client httpOnly cookie was already set by the
          // backend on the impersonate response and applies to this
          // same-origin tab automatically - no need (and no ability, since
          // it's httpOnly) to set it from JS here.
          setAuth({
            _id: normalizedId,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedUser?.email ?? "",
            role: normalizedUser?.role ?? "client",
            isEmailVerified: normalizedUser?.isEmailVerified,
          });

          // Non-sensitive marker so the impersonation banner knows to show
          // itself in this tab - no token value involved.
          sessionStorage.setItem("impersonation_active", "true");

          // Remove the query param from URL without reloading
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } catch (error) {
          console.error("Failed to parse impersonation data:", error);
        }
      }
    }
  }, [setAuth]);

  return null;
};
