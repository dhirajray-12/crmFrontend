import {
  useDashboardSummaryQuery,
  useProfileQuery,
  useRefreshWithdrawalData,
  useWithdrawalHistoryQuery,
} from "@/hooks/useIBWithdrawalQueries";
import { useWithdrawalStore } from "@/Store/Ibwithdrawal.store";
import { InfoCard } from "@/components/IbWithDrawalPage/InfoCard";
import { LoadingState } from "@/components/IbWithDrawalPage/LoadingState";
import { PageHeader } from "@/components/IbWithDrawalPage/PageHeader";
import { StatsCards } from "@/components/IbWithDrawalPage/StatsCards";
import { WithdrawalForm } from "@/components/IbWithDrawalPage/WithdrawalForm";
import { WithdrawalHistory } from "@/components/IbWithDrawalPage/WithdrawalHistory";

export default function IBWithdrawalPage() {
  const loading = useWithdrawalStore((state) => state.loading);

  // Fetch all data
  const { isLoading: profileLoading } = useProfileQuery();
  const { isLoading: dashboardLoading } = useDashboardSummaryQuery();
  const { isLoading: historyLoading } = useWithdrawalHistoryQuery();
  const refreshData = useRefreshWithdrawalData();

  const isLoading =profileLoading || dashboardLoading || historyLoading || loading;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <PageHeader onRefresh={refreshData} />

        <StatsCards />

        <InfoCard />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <WithdrawalForm />
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  );
}
