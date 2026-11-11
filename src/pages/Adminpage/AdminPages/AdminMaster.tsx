import { InfoBanner } from "@/AdminComponents/AdminMaster/InfoBanner";
import { MasterForm } from "@/AdminComponents/AdminMaster/MasterForm";
import { MasterTable } from "@/AdminComponents/AdminMaster/MasterTable";
import { PerformanceMetrics } from "@/AdminComponents/AdminMaster/PerformanceMetrics";
import { StatCard } from "@/AdminComponents/AdminMaster/StatCard";
import { useMasterStore } from "@/Store/master.store";
import {
  useCreateMaster,
  useDeleteMaster,
  useMasterData,
  useMasterSummary,
  useUpdateMaster,
} from "@/hooks/useMasterQueries";
import type { MasterSummary } from "@/types/master.types";
import { Activity, CheckCircle2, Clock3, Crown, Plus } from "lucide-react";
import { type ComponentType, useEffect } from "react";

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const fallbackSummary: MasterSummary = {
  totalMasters: 0,
  activeMasters: 0,
  totalCopiers: 0,
  totalProfit: 0,
  commissionEarned: 0,
  avgPerformance: 0,
  monthlyGrowth: 0,
};

const SummaryTile = ({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
        {label}
      </div>
      <Icon className="h-4 w-4 text-body" />
    </div>
    <div className="text-2xl font-semibold tracking-tight text-heading">
      {value}
    </div>
    <div className="mt-1 text-sm text-body">{detail}</div>
  </div>
);

export default function MasterPage() {
  const view = useMasterStore((s) => s.view);
  const mastersState = useMasterStore((s) => s.masters);
  const accountsState = useMasterStore((s) => s.accounts);
  const loadingState = useMasterStore((s) => s.loading);
  const errorState = useMasterStore((s) => s.error);
  const searchTerm = useMasterStore((s) => s.searchTerm);
  const expandedMaster = useMasterStore((s) => s.expandedMaster);
  const isRefreshing = useMasterStore((s) => s.isRefreshing);
  const formData = useMasterStore((s) => s.formData);
  const formLoading = useMasterStore((s) => s.formLoading);
  const formError = useMasterStore((s) => s.formError);
  const setView = useMasterStore((s) => s.setView);
  const setExpandedMaster = useMasterStore((s) => s.setExpandedMaster);
  const setSearchTerm = useMasterStore((s) => s.setSearchTerm);
  const setFormData = useMasterStore((s) => s.setFormData);
  const resetFormData = useMasterStore((s) => s.resetFormData);
  const setIsRefreshing = useMasterStore((s) => s.setIsRefreshing);
  const setFormLoading = useMasterStore((s) => s.setFormLoading);
  const setFormError = useMasterStore((s) => s.setFormError);
  const resetToMain = useMasterStore((s) => s.resetToMain);
  const { masters, accounts, isLoading, error, refetch } = useMasterData();
  const { data: summary } = useMasterSummary();
  const createMaster = useCreateMaster();
  const updateMaster = useUpdateMaster();
  const deleteMaster = useDeleteMaster();

  const setMasters = useMasterStore((s) => s.setMasters);
  const setAccounts = useMasterStore((s) => s.setAccounts);
  const setLoading = useMasterStore((s) => s.setLoading);
  const setError = useMasterStore((s) => s.setError);

  useEffect(() => {
    if (masters && masters.length) setMasters(masters);
    if (accounts && accounts.length) setAccounts(accounts);

    setLoading(isLoading);
    setError(error?.message || "");
  }, [
    masters,
    accounts,
    isLoading,
    error,
    setMasters,
    setAccounts,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    if (typeof view !== "string" && view.type === "update" && view.master) {
      setFormData({
        nickname: view.master.nickname,
        accountId: view.master.accountDetails.mt5Account,
        commission: view.master.commission.toString(),
        minimumInvestment: "1000",
        publicChatLink: "",
        strategyDescription: "",
      });
    } else if (view === "create") {
      resetFormData();
    }
  }, [view, setFormData, resetFormData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    setFormError("");

    try {
      if (typeof view === "string" && view === "create") {
        await createMaster.mutateAsync(formData);
      } else if (typeof view !== "string" && view.type === "update") {
        await updateMaster.mutateAsync({
          masterId: view.master.accountDetails.mt5Account,
          formData,
        });
      }

      await refetch();
      resetToMain();
    } catch (err: any) {
      setFormError(
        err.message ||
          `Failed to ${typeof view === "string" ? "create" : "update"} master`,
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMaster = async (masterId: string) => {
    if (!confirm("Are you sure you want to delete this master account?")) {
      return;
    }

    try {
      await deleteMaster.mutateAsync(masterId);
      await refetch();
    } catch (err: any) {
      alert(err.message || "Failed to delete master");
    }
  };

  const safeSummary = summary || fallbackSummary;
  const inactiveMasters = Math.max(
    safeSummary.totalMasters - safeSummary.activeMasters,
    0,
  );

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        {view === "list" ? (
          <>
            <section className="rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                    <Activity className="h-3.5 w-3.5" />
                    Master Operations
                  </div>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-heading">
                    Master Accounts
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm text-body">
                    Registry of masters, copiers, profit, and commissions.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm font-semibold text-body transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-strong"
                  >
                    <Clock3 className="h-4 w-4" />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={() => setView("create")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Create Master
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryTile
                  label="Total Masters"
                  value={String(safeSummary.totalMasters)}
                  detail={`${safeSummary.activeMasters} active`}
                  icon={Crown}
                />
                <SummaryTile
                  label="Copier Network"
                  value={String(safeSummary.totalCopiers)}
                  detail="Linked copiers"
                  icon={CheckCircle2}
                />
                <SummaryTile
                  label="Total Profit"
                  value={formatCurrency(safeSummary.totalProfit)}
                  detail="Total profit"
                  icon={Activity}
                />
                <SummaryTile
                  label="Inactive"
                  value={String(inactiveMasters)}
                  detail="Need review"
                  icon={Clock3}
                />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Masters"
                value={safeSummary.totalMasters}
                subtitle="In registry"
                icon="users"
                color="blue"
              />
              <StatCard
                title="Total Copiers"
                value={safeSummary.totalCopiers}
                subtitle="Active followers"
                icon="users"
                color="emerald"
              />
              <StatCard
                title="Total Profit"
                value={formatCurrency(safeSummary.totalProfit)}
                subtitle="Total output"
                icon="profit"
                color="purple"
              />
              <StatCard
                title="Commission Earned"
                value={formatCurrency(safeSummary.commissionEarned)}
                subtitle="Copier revenue"
                icon="commission"
                color="amber"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
              <InfoBanner />
              <PerformanceMetrics
                summary={safeSummary}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            </section>

            <MasterTable
              masters={mastersState}
              loading={loadingState}
              error={errorState}
              searchTerm={searchTerm}
              expandedMaster={expandedMaster}
              onSearchChange={setSearchTerm}
              onCreateClick={() => setView("create")}
              onEditClick={(master) => setView({ type: "update", master })}
              onViewCopiers={(masterId) =>
                setExpandedMaster(expandedMaster === masterId ? null : masterId)
              }
              onDeleteClick={handleDeleteMaster}
              onRetry={refetch}
            />
          </>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                <Crown className="h-3.5 w-3.5" />
                {typeof view === "string" ? "Create Master" : "Update Master"}
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-heading">
                {typeof view === "string" ? "New Master" : "Edit Master"}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-body">
                Account, commission, and strategy in one form.
              </p>
            </section>

            <MasterForm
              mode={typeof view === "string" ? "create" : "update"}
              master={typeof view !== "string" ? view.master : undefined}
              accounts={accountsState}
              formData={formData}
              formLoading={formLoading}
              formError={formError}
              onBack={resetToMain}
              onFormChange={(data) => setFormData(data)}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
