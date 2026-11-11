import { useAuthStore } from "@/Store/auth.store";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import VoicePageNavigator from "@/components/VoicePageNavigator";
import Sidebar from "../ClientLayout/Sidebar";
import Topbar from "../ClientLayout/Topbar";
import { ImpersonationBanner } from "@/components/StopImpersantion/StopImpersonationButton";
import { getTourPageKey } from "@/components/AppTour/tours";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const ClientLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();
  const tourPageKey = getTourPageKey(location.pathname);
  const scrollRef = useScrollToTop<HTMLDivElement>();

  // Prevent access if not a client
  if (!user || user.role !== "client") {
    return (
      <div className="client-theme-bg flex h-screen items-center justify-center px-4">
        <div className="client-theme-surface-strong rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-700 dark:text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-heading mb-2">
            Unauthorized Access
          </h2>
          <p className="text-body">
            This area is restricted to clients only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden vortex-bg">
      {/* Animated vortex background */}
      <div className="vortex-orb vortex-orb--1"></div>
      <div className="vortex-orb vortex-orb--2"></div>
      <div className="vortex-orb vortex-orb--3"></div>
      <div className="vortex-orb vortex-orb--4"></div>

      {/* Main layout with proper gap */}
      <div className="relative z-10 flex h-screen gap-3 overflow-hidden px-2 py-2 lg:px-3 lg:py-3">
        {/* Sidebar - ✅ Fixed z-index */}
        <div
          data-tour-anchor="client-sidebar"
          className="flex h-full min-h-0 flex-shrink-0"
        >
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main content area */}
        <div className="relative flex min-w-0 flex-1 flex-col gap-3">
          {/* Topbar - ✅ Reduced z-index so sidebar appears above it */}
          <div className="relative z-30" data-tour-anchor="client-topbar">
            <Topbar setSidebarOpen={setSidebarOpen} />
          </div>

          {/* Page content with proper overflow handling */}
          <main className="client-theme-surface relative flex-1 overflow-hidden rounded-2xl lg:rounded-[28px]">
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto overflow-x-hidden"
              data-tour-page={tourPageKey}
            >
              <ImpersonationBanner />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <VoicePageNavigator />
    </div>
  );
};

export default ClientLayout;
