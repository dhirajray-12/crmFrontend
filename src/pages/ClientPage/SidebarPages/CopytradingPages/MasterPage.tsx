import { InfoBanner } from "@/components/MasterPage/InfoBanner/InfoBanner";
import { MasterForm } from "@/components/MasterPage/MasterForm/MasterForm";
import { MasterHeader } from "@/components/MasterPage/MasterHeader/MasterHeader";
import { MastersTable } from "@/components/MasterPage/MastersTable/MastersTable";
import { PerformanceMetrics } from "@/components/MasterPage/PerformanceMetrics/PerformanceMetrics";
import { SearchBar } from "@/components/MasterPage/SearchBar/SearchBar";
import { SummaryCards } from "@/components/MasterPage/SummaryCards/SummaryCards";
import { useCopiers } from "@/hooks/useMasterPageCopiers";
import { useMasters } from "@/hooks/useMastersPage";
import { masterApi } from "@/services/MasterPage.service";
import type { View } from "@/types/MasterPage.type";
import { useState } from "react";

export default function MasterPage() {
  const [view, setView] = useState<View>("list");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    masters,
    accounts,
    loading,
    error,
    isRefreshing,
    summary,
    refresh,
    fetchData,
  } = useMasters();

  const { expandedMaster, toggleCopiers } = useCopiers();

  const handleCreateMaster = async (data: any) => {
    await masterApi.createMaster(data);
  };

  const handleUpdateMaster = async (data: any) => {
    if (typeof view !== "string" && view.master) {
      await masterApi.updateMaster(view.master.accountDetails.mt5Account, data);
    }
  };

  const handleDeleteMaster = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this master account?"))
      return;
    try {
      await masterApi.deleteMaster(accountId);
      await fetchData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete master";
      alert(errorMessage);
    }
  };

  const handleUpdateClick = (master: any) => {
    setView({ type: "update", master });
  };

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <MasterHeader
          mode={view === "list" ? "Portfolio overview" : "Master setup form"}
          masterCount={masters.length}
          accountCount={accounts.length}
          isRefreshing={isRefreshing}
        />

        {view === "list" ? (
          <>
            <InfoBanner />
            <SummaryCards summary={summary} />

            <PerformanceMetrics
              summary={summary}
              isRefreshing={isRefreshing}
              onRefresh={refresh}
            />

            <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-heading">
                  Master accounts board
                </h2>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {masters.length} configured
                </span>
              </div>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateClick={() => setView("create")}
              />

              <div className="mt-4">
                <MastersTable
                  masters={masters}
                  loading={loading}
                  error={error}
                  searchTerm={searchTerm}
                  expandedMaster={expandedMaster}
                  onUpdate={handleUpdateClick}
                  onDelete={handleDeleteMaster}
                  onToggleExpand={toggleCopiers}
                  onRetry={fetchData}
                  onCreateClick={() => setView("create")}
                />
              </div>
            </div>
          </>
        ) : (
          <MasterForm
            mode={typeof view === "string" ? view : "update"}
            master={typeof view !== "string" ? view.master : undefined}
            accounts={accounts}
            onSubmit={
              typeof view === "string" ? handleCreateMaster : handleUpdateMaster
            }
            onCancel={() => setView("list")}
          />
        )}
      </div>
    </div>
  );
}
