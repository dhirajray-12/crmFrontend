// PartnerDashboard.tsx
import { DashboardHeader } from "@/components/PartnerDashboard/DashboardHeader";
import { LoadingState } from "@/components/PartnerDashboard/LoadingState";
import { NoIBConfig } from "@/components/PartnerDashboard/NoIbConfig";
import { PartnersTable } from "@/components/PartnerDashboard/PartnersTable";
import { PendingDownlineAssignments } from "@/components/PartnerDashboard/PendingDownlineAssignments";
import { StatsCards } from "@/components/PartnerDashboard/StaticCard";
import { TabNavigation } from "@/components/PartnerDashboard/TabNavigation";
import { WithdrawalHistory } from "@/components/PartnerDashboard/WithdrawalHistory";
import { WithdrawalFormModal } from "@/components/PartnerDashboard/WithdrawalModal";
import { usePartnerQueries } from "@/hooks/PartnerDashboard";
import { usePartnerStore } from "@/Store/PartnerDasboardStore";
import { useAuthStore } from "@/Store/auth.store";
import { copyToClipboard } from "@/utils/PartnerDashboard.utils";
import { getSocketServerUrl } from "@/utils/socketUrl";
import { subscribeToClientRealtime } from "@/lib/clientRealtimeSocket";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDownCircle,
  ChevronRight,
  Network,
  WalletCards,
} from "lucide-react";
import React, { useEffect } from "react";

const PartnerDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Queries
  const {
    useIBConfig,
    useCreateIBConfig,
    useDashboardSummary,
    usePartners,
    useWithdrawals,
    useRequestWithdrawal,
    usePendingDownline,
    useAssignDownlineCommission,
  } = usePartnerQueries();

  // Store
  const {
    activeTab,
    showWithdrawalForm,
    filterStatus,
    copiedCode,
    withdrawalFormData,
    setActiveTab,
    setShowWithdrawalForm,
    setFilterStatus,
    setCopiedCode,
    updateWithdrawalFormData,
    resetWithdrawalForm,
  } = usePartnerStore();

  // Fetch data
  const {
    data: ibConfig,
    isLoading: ibLoading,
    refetch: refetchIB,
  } = useIBConfig();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const {
    data: withdrawals,
    isLoading: withdrawalsLoading,
    refetch: refetchWithdrawals,
  } = useWithdrawals();
  const { data: pendingDownlineData } = usePendingDownline();
  const createIBConfig = useCreateIBConfig();
  const requestWithdrawal = useRequestWithdrawal();
  const assignDownlineCommission = useAssignDownlineCommission();

  const isLoading =
    ibLoading || summaryLoading || partnersLoading || withdrawalsLoading;
  const isFlatMode = summary?.commissionMode === "flat";

  // Admin can flip a group between Sub-IB and Normal Commission mode at any
  // time; refetch the summary (which resolves commissionMode fresh, never
  // from cache) instead of waiting for the next manual refresh/poll.
  useEffect(() => {
    if (!user?._id) return;

    return subscribeToClientRealtime(
      { userId: user._id, serverUrl: getSocketServerUrl() },
      "group_commissionMode_updated",
      () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
    );
  }, [user?._id, queryClient]);

  const handleRefresh = async () => {
    await Promise.all([refetchIB(), refetchWithdrawals()]);
  };

  const handleCopyCode = async () => {
    if (ibConfig?.referralCode) {
      const success = await copyToClipboard(ibConfig.referralCode);
      if (success) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  const handleCreateIBConfig = async () => {
    try {
      await createIBConfig.mutateAsync();
    } catch (error) {
      console.error("Error creating IB config:", error);
    }
  };

  const handleAssignDownlineCommission = async (
    childConfigId: string,
    maximumCommission: number,
  ) => {
    await assignDownlineCommission.mutateAsync({ childConfigId, maximumCommission });
  };

  const handleWithdrawalSubmit = async () => {
    if (
      !withdrawalFormData.amount ||
      parseFloat(withdrawalFormData.amount) <= 0
    ) {
      alert("Please enter a valid amount");
      return;
    }

    if (
      parseFloat(withdrawalFormData.amount) >
      (summary?.withdrawableBalance || 0)
    ) {
      alert("Insufficient balance");
      return;
    }

    try {
      const result = await requestWithdrawal.mutateAsync(withdrawalFormData);
      if (result.success) {
        alert("Withdrawal request submitted successfully!");
        setShowWithdrawalForm(false);
        resetWithdrawalForm();
      } else {
        alert(result.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("Error submitting withdrawal request");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!ibConfig) {
    return <NoIBConfig onCreateConfig={handleCreateIBConfig} />;
  }

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <DashboardHeader
          ibConfig={ibConfig}
          onRefresh={handleRefresh}
          onCopyCode={handleCopyCode}
          isRefreshing={createIBConfig.isPending}
          copiedCode={copiedCode}
          commissionMode={summary?.commissionMode}
        />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Per-user commission ceilings/delegation only exist in Sub-IB
            (waterfall) mode — Normal Commission pays a fixed rate per level,
            so there's nothing here to approve or assign. */}
        {!isFlatMode && ibConfig.isPendingAssignment && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Your maximum commission is awaiting admin approval. Your referral link
            still works, but no commission will be paid out until it's assigned.
          </div>
        )}

        {activeTab === "overview" && summary && (
          <div className="space-y-4 sm:space-y-6">
            {!isFlatMode && (pendingDownlineData?.pending?.length ?? 0) > 0 && (
              <PendingDownlineAssignments
                pending={pendingDownlineData!.pending}
                myMaximumCommission={pendingDownlineData!.myMaximumCommission}
                onAssign={handleAssignDownlineCommission}
                isAssigning={assignDownlineCommission.isPending}
              />
            )}

            <StatsCards summary={summary} />

            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
                <Network className="h-5 w-5 text-accent" />
                Next actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowWithdrawalForm(true)}
                  disabled={summary.withdrawableBalance <= 0}
                  data-voice-target="request withdrawal"
                  className="flex w-full items-center justify-between rounded-lg border border-accent/20 bg-accent/10 px-4 py-3.5 text-left font-semibold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <ArrowDownCircle className="h-5 w-5" />
                    Request withdrawal
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab("partners")}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-3.5 text-left font-semibold text-heading transition hover:bg-surface-strong/[0.08]"
                >
                  <span className="flex items-center gap-3">
                    <Network className="h-5 w-5 text-subtle" />
                    Review partner network
                  </span>
                  <ChevronRight className="h-4 w-4 text-subtle" />
                </button>
                <button
                  onClick={() => setActiveTab("withdrawals")}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-3.5 text-left font-semibold text-heading transition hover:bg-surface-strong/[0.08]"
                >
                  <span className="flex items-center gap-3">
                    <WalletCards className="h-5 w-5 text-subtle" />
                    Inspect payout history
                  </span>
                  <ChevronRight className="h-4 w-4 text-subtle" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "partners" && (
          <PartnersTable partners={partners || []} />
        )}

        {activeTab === "withdrawals" && (
          <WithdrawalHistory
            withdrawals={withdrawals || []}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        )}
      </div>

      <WithdrawalFormModal
        isOpen={showWithdrawalForm}
        onClose={() => setShowWithdrawalForm(false)}
        onSubmit={handleWithdrawalSubmit}
        formData={withdrawalFormData}
        onFormChange={updateWithdrawalFormData}
        availableBalance={summary?.withdrawableBalance || 0}
      />
    </div>
  );
};

export default PartnerDashboard;
