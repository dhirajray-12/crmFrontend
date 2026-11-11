import React, { useState } from "react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAdminPaymentAlerts } from "@/hooks/useAdminPaymentAlerts";
import AdminDeviceSessionsPanel from "../../pages/Adminpage/DashboardComponents/AdminDeviceSessionsPanel";

import RevenueAnalytics from "../../pages/Adminpage/DashboardComponents/RevenueAnalytics";
import { StatsCard } from "../../pages/Adminpage/DashboardComponents/StatCard"; // Points to the updated StatsCard.tsx
import { DashboardHeader } from "../../pages/Adminpage/DashboardComponents/DashboardHeader";
import { RecentTransactions } from "../../pages/Adminpage/DashboardComponents/RecentTransactions";
import { TopClients } from "../../pages/Adminpage/DashboardComponents/TopClients";
//import { SidebarNavigation } from "/SidebarNavigation"; // Separate file
// import { Menu, X } from "lucide-react"; // For mobile toggle
import ChartRadialLabel from "../../pages/Adminpage/DashboardComponents/ChartRadialLabel";
import TodayPerformanceCards from "../../pages/Adminpage/DashboardComponents/TodaysPerformanceCards";
import RiskExposureDashboard from "../../pages/Adminpage/DashboardComponents/RiskExposureDashboard";

type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("connecting");
  const [realtimeMessage, setRealtimeMessage] = useState<string | undefined>();
  const paymentAlertState = useAdminPaymentAlerts();

  useRealtimeSync({
    events: ["deposit_updated", "withdrawal_updated", "transfer_updated"],
    onStatusChange: (status, details) => {
      setRealtimeStatus(status);
      setRealtimeMessage(details?.message);
    },
    onEvent: (event, data) => {
      if (event === "cache_invalidate") {
        const keys = data?.keys || [];
        if (keys.includes("admin_dashboard")) {
          window.dispatchEvent(new CustomEvent("crm:admin-dashboard-refresh"));
        }
        return;
      }

      if (
        event === "deposit_updated" ||
        event === "withdrawal_updated" ||
        event === "transfer_updated"
      ) {
        window.dispatchEvent(new CustomEvent("crm:admin-dashboard-refresh"));
      }
    },
  });

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-page min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="mx-auto flex min-w-0 max-w-[1440px] flex-1 flex-col gap-6 overflow-x-hidden">
        <section className="flex flex-col gap-6">
          <DashboardHeader
            realtimeStatus={realtimeStatus}
            realtimeMessage={realtimeMessage}
            paymentAlertState={paymentAlertState}
          />
        </section>

        <section
          className="admin-surface rounded-[28px] p-5 sm:p-6"
          data-tour-anchor="admin-dashboard-stats"
        >
          <StatsCard />
        </section>

        <section
          className="flex flex-col gap-6"
          data-tour-anchor="admin-dashboard-analytics"
        >
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <RevenueAnalytics />
          </div>
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <ChartRadialLabel />
          </div>
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <RiskExposureDashboard />
          </div>
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <TodayPerformanceCards />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <RecentTransactions />
          </div>
          <div className="admin-surface rounded-[28px] p-5 sm:p-6">
            <TopClients />
          </div>
        </section>

        <section className="admin-surface rounded-[28px] p-5 sm:p-6">
          <div>
            <AdminDeviceSessionsPanel />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
