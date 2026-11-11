import { MobileFilterDrawer } from "@/components/TransactionHistory/FilterSidebar/MobileFilterDrawer";
import { Pagination } from "@/components/TransactionHistory/Pagination/Pagination";
import { SearchBar } from "@/components/TransactionHistory/SearchBar/SearchBar";
import { TransactionHero } from "@/components/TransactionHistory/TransactionHero/TransactionHero";
import { TransactionsTable } from "@/components/TransactionHistory/TransactionsTable/TransactionsTable";
import { useFilters } from "@/hooks/useTransferHistoryFilters";
import { usePagination } from "@/hooks/useTransferHistoryPagination";
import { useTransactions } from "@/hooks/useTransferTransactions";
import { ITEMS_PER_PAGE } from "@/utils/TransferHistoryConstant";
import { exportToCSV } from "@/utils/TransferHistoryHelper";
import { Activity, CheckCircle2, Clock3 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function TransactionHistoryPage() {
  const { transactions, loading } = useTransactions();

  const {
    filters,
    filteredTransactions,
    updateSearch,
    updateFilterType,
    updateSelectedDate,
  } = useFilters(transactions);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(filteredTransactions, ITEMS_PER_PAGE);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.filterType !== "All") count += 1;
    if (filters.selectedDate) count += 1;
    return count;
  }, [filters.filterType, filters.selectedDate]);

  const handleExport = useCallback(() => {
    exportToCSV(filteredTransactions);
  }, [filteredTransactions]);

  const activitySummary = [
    {
      label: "Records",
      value: filteredTransactions.length,
      icon: Activity,
      accentColor: "bg-accent",
      iconColor: "text-accent",
    },
    {
      label: "Successful",
      value: filteredTransactions.filter(
        (item) => item.status === "Success",
      ).length,
      icon: CheckCircle2,
      accentColor: "bg-emerald-400",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Pending",
      value: filteredTransactions.filter(
        (item) => item.status === "Pending",
      ).length,
      icon: Clock3,
      accentColor: "bg-amber-400",
      iconColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <TransactionHero
          totalCount={filteredTransactions.length}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={() => setIsFilterOpen(true)}
          onExport={handleExport}
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
          {activitySummary.map((card) => {
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
          data-tour-anchor="history-table"
        >
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-heading">
                Transaction Ledger
              </h2>
              <p className="mt-0.5 text-xs text-subtle">
                {filteredTransactions.length} transaction
                {filteredTransactions.length === 1 ? "" : "s"} in view
              </p>
            </div>

            <div data-tour-anchor="history-search">
              <SearchBar value={filters.search} onChange={updateSearch} />
            </div>
          </div>

          <TransactionsTable transactions={paginatedItems} loading={loading} />

          {filteredTransactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrev={prevPage}
            />
          )}
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedType={filters.filterType}
        onTypeSelect={updateFilterType}
        selectedDate={filters.selectedDate}
        onDateSelect={updateSelectedDate}
        onExport={handleExport}
      />
    </div>
  );
}
