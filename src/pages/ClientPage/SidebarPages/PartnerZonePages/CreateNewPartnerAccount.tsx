import { PartnerAccountDetails } from "@/components/PartnerAccount/PartnerAccountDetails";
import { PartnerEmptyState } from "@/components/PartnerAccount/PartnerEmptyState";
import { PartnerErrorToast } from "@/components/PartnerAccount/PartnerErrorToast";
import { PartnerHeader } from "@/components/PartnerAccount/PartnerHeader";
import { PartnerInfoSection } from "@/components/PartnerAccount/PartnerInfoSection";
import { PartnerLoadingState } from "@/components/PartnerAccount/PartnerLoadingState";
import { PartnerStats } from "@/components/PartnerAccount/PartnerStats";
import {
  useDashboardSummaryQuery,
  usePartnerConfigQuery,
  useRefreshPartnerData,
} from "@/hooks/usePartnerQueries";

export default function CreateNewPartnerAccount() {
  const refreshPartnerData = useRefreshPartnerData();

  const {
    data: partnerConfig,
    isLoading: configLoading,
    error: configError,
  } = usePartnerConfigQuery();

  const {
    data: dashboardSummary,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardSummaryQuery();

  const isLoading = configLoading || dashboardLoading;

  const error =
    (configError as Error | null)?.message ||
    (dashboardError as Error | null)?.message ||
    null;

  if (isLoading) {
    return <PartnerLoadingState />;
  }

  if (!partnerConfig) {
    return <PartnerEmptyState />;
  }

  if (error) {
    return <PartnerErrorToast message={error} />;
  }

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <PartnerHeader onRefresh={refreshPartnerData} />

        <div className="mt-5 sm:mt-6">
          <PartnerStats summary={dashboardSummary} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 xl:grid-cols-[1.2fr_0.8fr]">
          <PartnerAccountDetails
            config={partnerConfig}
            summary={dashboardSummary}
          />

          <PartnerInfoSection />
        </div>
      </div>
    </div>
  );
}
