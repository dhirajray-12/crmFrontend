import { Pagination } from "@/components/DepositPage/common/Pagination";
import { TableHeader } from "@/components/TransferPage/RecentTransfers/TableHeader";
import {
  MobileTransfersList,
  TransfersTable,
} from "@/components/TransferPage/RecentTransfers/RecentTransfers";
import { TransferFilterSidebar } from "@/components/TransferPage/TransferFilters/TransferFilterSidebar";
import { TransferForm } from "@/components/TransferPage/TransferForm/TransferForm";
import { TransferHero } from "@/components/TransferPage/TransferHero/TransferHero";
import { useFilters } from "@/hooks/useTransferFilters";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useTransferForm } from "@/hooks/useTransferForm";
import { useTransfers } from "@/hooks/useTransfers";
import { useToastStore } from "@/Store/toast.store";
import { defaultAccountTypes, defaultStatusOptions } from "@/utils/constants";
import "@/utils/transferAnimations.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function TransferPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const addToast = useToastStore((state) => state.addToast);
  const transferGuard = useActionGuard({
    isBusy: isProcessing,
    warningMessage:
      "A transfer is already being processed. Please wait for the current transfer to complete.",
  });

  const { accounts, transfers, createTransfer } = useTransfers();
  const {
    filters,
    filteredTransfers,
    activeFiltersCount,
    toggleAccountType,
    toggleStatus,
    updateDate,
    clearAllFilters,
  } = useFilters(transfers);

  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const transferActivity = [
    {
      label: "Transfers",
      value: filteredTransfers.length,
      icon: ArrowRightLeft,
      accentColor: "bg-accent",
      iconColor: "text-accent",
    },
    {
      label: "Completed",
      value: filteredTransfers.filter(
        (item) => item.status.toLowerCase() === "completed",
      ).length,
      icon: CheckCircle2,
      accentColor: "bg-emerald-400",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Pending",
      value: filteredTransfers.filter(
        (item) => item.status.toLowerCase() === "pending",
      ).length,
      icon: Clock3,
      accentColor: "bg-amber-400",
      iconColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  const {
    formData,
    fromDropdownOpen,
    toDropdownOpen,
    setFromDropdownOpen,
    setToDropdownOpen,
    selectFromAccount,
    selectToAccount,
    updateAmount,
    resetForm,
    validateForm,
  } = useTransferForm();

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target as Node)
      ) {
        setFromDropdownOpen(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target as Node)
      ) {
        setToDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setFromDropdownOpen, setToDropdownOpen]);

  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      addToast(type, message);
    },
    [addToast],
  );

  const handleTransfer = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      await transferGuard.run(async () => {
        const validation = validateForm();
        if (!validation.isValid) {
          showToast("error", validation.error || "Invalid form");
          return;
        }

        if (!formData.fromAccount || !formData.toAccount) {
          showToast("error", "Please select both accounts");
          return;
        }

        try {
          setIsProcessing(true);

          const result = await createTransfer(
            formData.fromAccount._id,
            formData.toAccount._id,
            parseFloat(formData.amount),
          );

          if (result.success) {
            showToast("success", "Transfer completed successfully");
            resetForm();
          } else {
            showToast("error", result.error || "Transfer failed");
          }
        } catch (error: any) {
          showToast("error", error?.message || "Transfer failed");
        } finally {
          setIsProcessing(false);
        }
      });
    },
    [transferGuard, validateForm, formData, createTransfer, resetForm, showToast],
  );

  const handleExportTransfers = useCallback(() => {
    if (filteredTransfers.length === 0) {
      showToast("info", "No transfers available to export");
      return;
    }

    const rows = filteredTransfers.map((transfer) => ({
      date: new Date(transfer.createdAt).toISOString(),
      fromAccount: transfer.fromAccount?.mt5Account ?? "N/A",
      fromType: transfer.fromAccount?.accountType ?? "N/A",
      toAccount: transfer.toAccount?.mt5Account ?? "N/A",
      toType: transfer.toAccount?.accountType ?? "N/A",
      amount: transfer.amount,
      status: transfer.status,
    }));

    const header = [
      "Date",
      "From Account",
      "From Type",
      "To Account",
      "To Type",
      "Amount",
      "Status",
    ];

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        [
          row.date,
          row.fromAccount,
          row.fromType,
          row.toAccount,
          row.toType,
          row.amount,
          row.status,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transfer-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("success", "Transfer history exported");
  }, [filteredTransfers, showToast]);

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <TransferHero
          totalTransfers={filteredTransfers.length}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={() => setFilterOpen(true)}
          onExport={handleExportTransfers}
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
          {transferActivity.map((card) => {
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

        <div className="mt-5 sm:mt-6" data-tour-anchor="transfer-form">
          <TransferForm
            accounts={accounts}
            formData={formData}
            fromDropdownOpen={fromDropdownOpen}
            toDropdownOpen={toDropdownOpen}
            setFromDropdownOpen={setFromDropdownOpen}
            setToDropdownOpen={setToDropdownOpen}
            selectFromAccount={selectFromAccount}
            selectToAccount={selectToAccount}
            updateAmount={updateAmount}
            handleTransfer={handleTransfer}
            isProcessing={isProcessing}
            fromDropdownRef={fromDropdownRef}
            toDropdownRef={toDropdownRef}
          />
        </div>

        <div
          className="mt-5 overflow-hidden rounded-xl border border-border bg-surface sm:mt-6"
          data-tour-anchor="transfer-feed"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-heading">
                Recent Transfers
              </h2>
              <p className="mt-0.5 text-xs text-subtle">
                {filteredTransfers.length} transfer
                {filteredTransfers.length === 1 ? "" : "s"} in view
              </p>
            </div>
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full text-left">
              <TableHeader />
              <tbody className="divide-y divide-border">
                <TransfersTable transfers={paginatedTransfers} />
              </tbody>
            </table>
          </div>

          <div className="xl:hidden">
            <MobileTransfersList transfers={paginatedTransfers} />
          </div>

          {filteredTransfers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredTransfers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-999 bg-surface-strong"
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface-strong p-4 shadow-2xl md:left-1/2 md:top-1/2 md:max-h-[74vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-heading">
                  <SlidersHorizontal className="h-4 w-4 text-accent" />
                  Filter transfers
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.05] hover:text-heading"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-4">
                <TransferFilterSidebar
                  selectedAccountTypes={filters.selectedAccountTypes}
                  selectedStatuses={filters.selectedStatuses}
                  selectedDate={filters.selectedDate}
                  onToggleAccountType={toggleAccountType}
                  onToggleStatus={toggleStatus}
                  onDateChange={updateDate}
                  onClearAll={clearAllFilters}
                  defaultAccountTypes={defaultAccountTypes}
                  defaultStatusOptions={defaultStatusOptions}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
