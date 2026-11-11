// frontend/src/components/AuthInitializer/AuthInitializer.tsx - UPDATED
import { useAuthStore } from "@/Store/auth.store";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const AuthInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasInitialized = useRef(false);
  const pathname = location.pathname;
  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/create-account") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/unauthorized");
  const hasImpersonationToken = !!sessionStorage.getItem("impersonation_active");
  const shouldInitialize = !isAuthRoute || isAuthenticated || hasImpersonationToken;

  useEffect(() => {
    // Keep public auth pages stable and avoid an unnecessary /auth/me check there.
    if (!shouldInitialize) {
      return;
    }

    if (!hasInitialized.current && !isInitialized) {
      hasInitialized.current = true;
      initialize();
    }
  }, [initialize, isInitialized, shouldInitialize]);

  if (isLoading && shouldInitialize) {
    return (
      <div className="client-theme-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/18 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/14 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-400/10 blur-3xl" />
        <div className="client-theme-surface-strong relative rounded-3xl border border-border px-8 py-7 text-center shadow-[0_22px_54px_rgba(2,6,23,0.36)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent/70 border-t-transparent"></div>
          </div>
          <p className="font-medium text-heading">Loading your account...</p>
          <p className="mt-1 text-sm text-subtle">Checking your session and permissions.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
