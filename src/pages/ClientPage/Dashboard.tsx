import { useToastStore } from "@/Store/toast.store";
import { useAuthStore } from "@/Store/auth.store";
import { DashboardSkeleton } from "@/components/Common/LoadingSkeleton";
import DeviceSecurityPanel from "@/components/DeviceSecurity/DeviceSecurityPanel";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { formatCurrency } from "@/utils/dashboardUtils";
import { lazy, Suspense, useEffect, useState } from "react";
import type { DashboardData as DashboardDataType } from "@/types/dashboard.types";
import type { UseQueryResult } from "@tanstack/react-query";
import AccountsTable from "../ClientPage/DashboardComponents/AccountsTable";
import AiForexForecast from "../ClientPage/DashboardComponents/AiForexForecast";
import ForexCryptoChart from "../ClientPage/DashboardComponents/ForexCryptoChart";
import GlobalProgress from "../ClientPage/DashboardComponents/GlobalProgress";
import MarketSentimentPopup from "../ClientPage/DashboardComponents/MarketSentimentPopup";
import TodayPerformanceCards from "../ClientPage/DashboardComponents/TodayPerformanceCards";
import TransactionsTable from "../ClientPage/DashboardComponents/TransactionsTable";
import Welcome from "../ClientPage/DashboardComponents/Welcome";
import WhatsAppJoinPopup from "../ClientPage/DashboardComponents/WhatsAppJoinPopup";
import ConnectedKpiCards from "./DashboardComponents/DashboardKpiCards";
import { Panel } from "./DashboardComponents/ui/Panel";
import { Pill } from "./DashboardComponents/ui/Pill";

const AccountActivityChart = lazy(
  () => import("../ClientPage/DashboardComponents/AccountActivityChart"),
);

function useMobileDashboardView() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isMobile;
}

function DashboardChartFallback() {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-40 rounded-full bg-surface-strong/10" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`chart-metric-skeleton-${index}`} className="h-20 rounded-xl bg-surface-strong/[0.04]" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-surface-strong/[0.04]" />
      </div>
    </Panel>
  );
}

/** Compact mobile-only hero: greeting plus the four headline numbers up front. */
function MobileHero({
  firstName,
  data,
}: {
  firstName?: string;
  data?: DashboardDataType;
}) {
  const cells = [
    { label: "Balance", value: data ? formatCurrency(data.totalBalance) : "$0.00" },
    { label: "Deposits", value: data ? formatCurrency(data.totalDeposits) : "$0.00" },
    { label: "Withdrawals", value: data ? formatCurrency(data.totalWithdrawals) : "$0.00" },
    { label: "Accounts", value: data ? `${data.totalMt5Accounts}` : "0" },
  ];

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Pill tone="emerald" dot>
            Live session
          </Pill>
          <h1 className="mt-2 text-lg font-bold tracking-tight text-heading">
            {firstName ? `${firstName}'s` : "Your"} portfolio
          </h1>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cells.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface-strong/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-[0.08em] text-subtle">{label}</p>
            <p className="mt-1 truncate font-mono text-sm font-semibold tabular-nums text-heading">
              {value}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const addToast = useToastStore((state) => state.addToast);
  const { user } = useAuthStore();
  const dashboardQuery = useDashboardData() as UseQueryResult<
    DashboardDataType,
    Error
  >;
  const { isLoading, refetch: refetchDashboard } = dashboardQuery;
  const isMobile = useMobileDashboardView();
  const dashboardData = dashboardQuery.data;

  // Force-refetch dashboard when balance-affecting events arrive so the client
  // always sees the latest balance without a manual page refresh.
  useRealtimeSync({
    events: ["withdrawal_updated", "account_updated", "deposit_updated", "transfer_updated"],
    onEvent: () => {
      void refetchDashboard();
    },
  });

  useEffect(() => {
    addToast("success", "Dashboard loaded.");
  }, [addToast]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-full overflow-x-hidden bg-app">
      <MarketSentimentPopup />
      <WhatsAppJoinPopup />
      <div className="space-y-4 px-2 py-3 pb-5 sm:px-3 sm:py-4 sm:pb-6 md:space-y-5 md:px-4 lg:px-6">
        {isMobile ? (
          <MobileHero firstName={user?.firstName} data={dashboardData} />
        ) : (
          <div data-tour-anchor="dashboard-welcome">
            <Welcome />
          </div>
        )}

        <div className="min-w-0" data-tour-anchor="dashboard-kpis">
          <ConnectedKpiCards queryResult={dashboardQuery} />
        </div>

        <div className="min-w-0" data-tour-anchor="dashboard-activity-chart">
          <Suspense fallback={<DashboardChartFallback />}>
            <AccountActivityChart />
          </Suspense>
        </div>

        <TodayPerformanceCards />

        <GlobalProgress />
        <AiForexForecast />
        <ForexCryptoChart />

        <div data-tour-anchor="dashboard-transactions">
          <TransactionsTable />
        </div>

        <DeviceSecurityPanel />

        <AccountsTable />
      </div>
    </div>
  );
}
