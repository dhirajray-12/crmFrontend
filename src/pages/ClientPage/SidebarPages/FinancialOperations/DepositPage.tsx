import { TableSkeleton } from "@/components/Common/LoadingSkeleton";
import { Pagination } from "@/components/DepositPage/common/Pagination";
import { DepositHero } from "@/components/DepositPage/DepositHero/DepositHero";
import {
  DepositsTable,
  MobileDepositsList,
} from "@/components/DepositPage/DepositsTable/DepositsTable";
import { MobileFilterDrawer } from "@/components/DepositPage/MobileFilterDrawer/MobileFilterDrawer";
import { useFilters } from "@/hooks/useDepositFilters";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import {
  depositApi,
  mapDepositToDepositData,
} from "@/services/DepositPage.service";
import { useToastStore } from "@/Store/toast.store";
import {
  applyRealtimeTransactionUpdate,
  captureRealtimeSnapshots,
  restoreRealtimeSnapshots,
} from "@/utils/clientDashboardRealtime";
import "@/utils/animations.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Inbox, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DepositModal from "../../DashboardComponents/DepositModal";

export default function DepositPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDepositModal, setOpenDepositModal] = useState(false);
  const itemsPerPage = 5;
  const addToast = useToastStore((state) => state.addToast);

  const {
    data: deposits = [],
    isLoading,
  } = useQuery({
    queryKey: ["deposits"],
    queryFn: () => depositApi.fetchDeposits(),
    staleTime: 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  const submitDepositMutation = useOptimisticMutation({
    mutationFn: async (formData: FormData) => {
      const response = await depositApi.submitDeposit(formData);
      if (!response.success) {
        throw new Error(response.message || "Failed to submit deposit");
      }
      return response;
    },
    invalidateKeys: [
      "deposits",
      "dashboardData",
      "transactions",
      "account_balances",
    ],
    optimisticUpdate: (variables, queryClient) => {
      const amount = variables.get("amount") as string;
      const paymentType = variables.get("paymentType") as string;
      const accountId = variables.get("accountId") as string;
      const tempId = `temp-${Date.now()}`;

      const optimisticDeposit = mapDepositToDepositData({
        id: tempId,
        _id: tempId,
        account: accountId,
        type: "N/A",
        paymentType,
        amount: Number(amount),
        createdAt: new Date().toISOString(),
        status: "Pending",
      });

      queryClient.setQueryData(["deposits"], (old: any) => {
        if (!old) {
          return [optimisticDeposit];
        }

        if (Array.isArray(old)) {
          return [optimisticDeposit, ...old];
        }

        return old;
      });

      const realtimeSnapshots = captureRealtimeSnapshots(queryClient);
      applyRealtimeTransactionUpdate(queryClient, {
        id: tempId,
        type: "deposit",
        amount: Number(amount),
        account: accountId,
        method: paymentType,
        createdAt: optimisticDeposit.createdAt,
      });

      return {
        optimisticDeposit,
        tempDepositId: tempId,
        realtimeSnapshots,
      };
    },
    onSuccess: (response: any, _variables, context) => {
      if (response?.data) {
        const mappedDeposit = mapDepositToDepositData({
          ...response.data,
          status: "Pending",
          approvedDate: undefined,
          approvedAt: undefined,
          dateProcessed: "-",
          timeProcessed: "-",
          timeTaken: "-",
          days: 0,
        });

        queryClient.setQueryData(["deposits"], (old: any) => {
          if (!old || !Array.isArray(old)) {
            return [mappedDeposit];
          }

          const withoutTemp = old.filter((item: any) => {
            const itemId = String(item?._id ?? item?.id ?? "");
            const tempDepositId = String(context?.tempDepositId ?? "");

            if (tempDepositId && itemId === tempDepositId) {
              return false;
            }

            return !(
              item?.status?.toLowerCase?.() === "pending" &&
              item?.amount === mappedDeposit.amount &&
              item?.method === mappedDeposit.method &&
              itemId.startsWith("temp-")
            );
          });

          return [mappedDeposit, ...withoutTemp];
        });
      }

      setOpenDepositModal(false);
      addToast("success", "Deposit submitted successfully");
    },
    onError: (error: any, _variables, context: any) => {
      restoreRealtimeSnapshots(queryClient, context?.realtimeSnapshots);
      const message =
        error?.message || "Failed to submit deposit. Please try again.";
      addToast("error", message);
    },
  });
  const depositSubmitGuard = useActionGuard({
    isBusy: submitDepositMutation.isPending,
    warningMessage:
      "A deposit request is already being processed. Please wait before trying again.",
  });

  const {
    filters,
    filteredData,
    activeFiltersCount,
    toggleAccountType,
    toggleStatus,
    updateDate,
    clearAllFilters,
    clearCategory,
  } = useFilters(deposits);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const activityCards = [
    {
      label: "Deposit requests",
      value: filteredData.length,
      icon: Inbox,
      accentColor: "bg-accent",
      iconColor: "text-accent",
    },
    {
      label: "Approved",
      value: filteredData.filter(
        (deposit) => deposit.status.toLowerCase() === "approved",
      ).length,
      icon: CheckCircle2,
      accentColor: "bg-emerald-400",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Rejected",
      value: filteredData.filter(
        (deposit) => deposit.status.toLowerCase() === "rejected",
      ).length,
      icon: XCircle,
      accentColor: "bg-rose-400",
      iconColor: "text-rose-700 dark:text-rose-300",
    },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Back from Stripe Checkout (?stripe=success|cancelled): tell the client what
  // happens next, refresh the list, and clean the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("stripe");
    if (!result) return;
    if (result === "success") {
      addToast("success", "Card payment received. Your deposit is being credited and will show as Approved in a moment.");
    } else if (result === "cancelled") {
      addToast("info", "Card payment cancelled. Nothing was charged.");
    }
    queryClient.invalidateQueries({ queryKey: ["deposits"] });
    params.delete("stripe");
    params.delete("deposit");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, [addToast, queryClient]);

  const handleDepositSuccess = useCallback(() => {}, []);

  const handleDepositError = useCallback(
    (errorMsg: string) => {
      addToast("error", errorMsg);
    },
    [addToast],
  );

  const handleDepositProcessing = useCallback(() => {
    addToast("info", "Processing your deposit request...");
  }, [addToast]);

  const handleSubmitDeposit = useCallback(
    async (formData: FormData) => {
      await depositSubmitGuard.run(async () => {
        await submitDepositMutation.mutateAsync(formData);
      });
    },
    [depositSubmitGuard, submitDepositMutation],
  );

  const handleOpenModal = useCallback(() => {
    setOpenDepositModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenDepositModal(false);
  }, []);

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <DepositHero
          activeFiltersCount={activeFiltersCount}
          isSubmitting={submitDepositMutation.isPending}
          onOpenFilters={() => setFilterOpen(true)}
          onNewDeposit={handleOpenModal}
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
          {activityCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
              >
                <div className={`absolute inset-y-0 left-0 w-1 ${card.accentColor}`} />
                <div className="flex items-center justify-between gap-2 pl-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    {card.label}
                  </span>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                <p className="mt-3 pl-2 text-2xl font-bold text-heading sm:text-[28px]">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-5 overflow-hidden rounded-xl border border-border bg-surface sm:mt-6"
          data-tour-anchor="deposit-ledger"
        >
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="min-w-full text-left">
                  <thead className="bg-surface-strong/[0.02]">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Account
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Type
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Method
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Amount
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Initiated
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Processed
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Time Taken
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <DepositsTable data={paginatedData} loading={isLoading} />
                  </tbody>
                </table>
              </div>

              <div className="xl:hidden">
                <MobileDepositsList data={paginatedData} loading={isLoading} />
              </div>

              {filteredData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>

        <MobileFilterDrawer
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          onToggleAccountType={toggleAccountType}
          onToggleStatus={toggleStatus}
          onUpdateDate={updateDate}
          onClearAll={clearAllFilters}
          onClearCategory={clearCategory}
        />

        <DepositModal
          open={openDepositModal}
          onClose={handleCloseModal}
          onProcessing={handleDepositProcessing}
          onSuccess={handleDepositSuccess}
          onError={handleDepositError}
          onSubmitDeposit={handleSubmitDeposit}
          isSubmitting={submitDepositMutation.isPending}
        />
      </div>
    </div>
  );
}
