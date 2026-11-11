import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";
import { getTourPageKey } from "@/components/AppTour/tours";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const SuperAdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const tourPageKey = getTourPageKey(location.pathname);
  const mainRef = useScrollToTop<HTMLElement>();

  return (
    <div className="admin-theme-shell flex h-screen overflow-hidden text-heading">
      <div data-tour-anchor="superadmin-sidebar">
        <SuperAdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div data-tour-anchor="superadmin-topbar">
          <SuperAdminTopbar setSidebarOpen={setSidebarOpen} />
        </div>
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
          data-tour-page={tourPageKey}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
