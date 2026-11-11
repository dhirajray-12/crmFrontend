import {
  usePartnersQuery,
  useRefreshCommissionData,
  useSummaryQuery,
  useTodaySummaryQuery,
  useTradeCommissionsQuery,
} from '@/hooks/useCommissionQueries';
import { useCommissionStore } from '@/Store/commission.store';
import { LoadingState } from '@/components/ComissionPage/LoadingState';
import { PageHeader } from '@/components/ComissionPage/PageHeader';
import { PartnerDetailsModal } from '@/components/ComissionPage/PartnerDetailsModal';
import { PartnersTable } from '@/components/ComissionPage/PartnersTable';
import { StatsGrid } from '@/components/ComissionPage/StatsGrid';

export default function IbCommissionPage() {
  const selectedPartner = useCommissionStore((state) => state.selectedPartner);
  const loading = useCommissionStore((state) => state.loading);

  // Fetch all data
  const { isLoading: partnersLoading } = usePartnersQuery();
  const { isLoading: summaryLoading } = useSummaryQuery(30);
  const { isLoading: todaySummaryLoading } = useTodaySummaryQuery();
  const { isLoading: tradesLoading } = useTradeCommissionsQuery();
  const refreshData = useRefreshCommissionData();

  const isLoading =
    partnersLoading || summaryLoading || todaySummaryLoading || tradesLoading || loading;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <PageHeader onRefresh={refreshData} />

        <StatsGrid />

        <PartnersTable />
      </div>

      {selectedPartner && <PartnerDetailsModal />}
    </div>
  );
}
