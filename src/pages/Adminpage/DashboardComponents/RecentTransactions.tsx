import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Hash,
  Mail,
  RefreshCw,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useAPI } from "../../../API/api.ts";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface Transaction {
  id: string;
  type: "Deposit" | "Withdrawal" | "Transfer";
  user: {
    name: string;
    email: string;
  };
  account: string;
  paymentMethod: string;
  amount: number;
  status: "Approved" | "Pending" | "Rejected";
  displayDate: string;
  completedAt: number;
}

interface TransactionResponse {
  data: Array<{
    id: string;
    type: "Deposit" | "Withdrawal" | "Transfer";
    user: { name: string; email: string };
    accountNumber: string;
    paymentMethod: string;
    amount: number;
    status: "Approved" | "Pending" | "Rejected";
    completedOn: string;
  }>;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// Theme-derived tone — mirrors the fix applied to TodaysPerformanceCards:
// colors are mixed from the superadmin-controlled --status-*/--surface-strong
// tokens (index.css) instead of fixed hex, so Deposit/Approved chips no
// longer sit on a pale near-white background that reads as "white" once the
// admin switches to a dark or differently-accented theme.
const tone = (statusVar: string) => ({
  text: `var(${statusVar})`,
  bg: `color-mix(in srgb, var(${statusVar}) 16%, var(--surface-strong))`,
  border: `color-mix(in srgb, var(${statusVar}) 42%, var(--border))`,
});
const greenTone = tone("--status-green");
const redTone = tone("--status-red");
const purpleTone = tone("--status-purple");

const getTypeConfig = (type: Transaction["type"]) => {
  switch (type) {
    case "Deposit":
      return { icon: ArrowUpRight, tone: greenTone };
    case "Withdrawal":
      return { icon: ArrowDownLeft, tone: redTone };
    default:
      return { icon: ArrowLeftRight, tone: purpleTone };
  }
};

const getStatusConfig = (status: Transaction["status"]) => {
  switch (status) {
    case "Approved":
      return { icon: CheckCircle2, tone: greenTone, dotColor: greenTone.text, label: "Approved" };
    case "Pending":
      return {
        icon: Clock3,
        tone: {
          text: "var(--body)",
          bg: "var(--surface-strong)",
          border: "var(--border)",
        },
        dotColor: "var(--accent-color)",
        label: "Pending",
      };
    default:
      return { icon: XCircle, tone: redTone, dotColor: redTone.text, label: "Rejected" };
  }
};

export const RecentTransactions: React.FC = () => {
  const { dashboardAPI } = useAPI();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [filterBy, setFilterBy] = useState<
    "All Types" | "Deposit" | "Withdrawal" | "Transfer"
  >("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const tableTopRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 8;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = (await dashboardAPI.getRecentTransactions(
        50,
      )) as TransactionResponse;

      const transformedData = response.data.map((transaction) => {
        const completedDate = new Date(transaction.completedOn);
        return {
          id: transaction.id,
          type: transaction.type,
          user: {
            name: transaction.user.name,
            email: transaction.user.email,
          },
          account: transaction.accountNumber,
          paymentMethod: transaction.paymentMethod,
          amount: transaction.amount,
          status: transaction.status,
          displayDate: completedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: getConfiguredTimezone(),
          }),
          completedAt: completedDate.getTime(),
        };
      });

      setTransactions(transformedData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
    const handleRealtimeRefresh = () => void fetchTransactions();
    const interval = setInterval(() => void fetchTransactions(), 30000);
    window.addEventListener(
      "crm:admin-dashboard-refresh",
      handleRealtimeRefresh,
    );
    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "crm:admin-dashboard-refresh",
        handleRealtimeRefresh,
      );
    };
  }, [dashboardAPI]);

  const filteredTransactions = transactions.filter((t) => {
    if (filterBy === "All Types") return true;
    return t.type === filterBy;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") return b.completedAt - a.completedAt;
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalVolume = filteredTransactions.reduce((s, t) => s + t.amount, 0);
  const approvedCount = filteredTransactions.filter(
    (t) => t.status === "Approved",
  ).length;
  const pendingCount = filteredTransactions.filter(
    (t) => t.status === "Pending",
  ).length;
  const rejectedCount = filteredTransactions.filter(
    (t) => t.status === "Rejected",
  ).length;

  if (loading && transactions.length === 0) {
    return (
      <div className="admin-surface rounded-[28px] p-8 flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-3xl border border-border bg-surface-strong p-5 shadow-[0_12px_28px_rgba(141,109,60,0.06)]">
          <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#162033] dark:text-heading">
            Loading Transaction Ledger
          </p>
          <p className="mt-1 text-base text-body">
            Fetching the latest transaction activity...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-surface rounded-[28px] overflow-hidden flex flex-col">
        {/* ── COMPACT HEADER ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-border/60">
          {/* Left: title + badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-surface-strong">
              <ArrowLeftRight className="h-4 w-4 text-body" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#162033] dark:text-heading leading-tight">
                Recent Transactions
              </h2>
              <p className="text-xs text-body leading-snug hidden sm:block">
                Tap any row for full details
              </p>
            </div>
          </div>

          {/* Right: filters + refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="admin-input rounded-xl px-3 py-2 text-sm font-semibold text-heading outline-none ring-0 focus:ring-0 h-9"
            >
              <option>All Types</option>
              <option>Deposit</option>
              <option>Withdrawal</option>
              <option>Transfer</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="admin-input rounded-xl px-3 py-2 text-sm font-semibold text-heading outline-none ring-0 focus:ring-0 h-9"
            >
              <option value="date">By Date</option>
              <option value="amount">By Amount</option>
              <option value="status">By Status</option>
            </select>

            <button
              onClick={() => void fetchTransactions()}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-strong text-body transition hover:bg-surface-strong hover:text-[#162033] dark:text-heading disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── STATS STRIP ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-5 sm:px-7 py-3 border-b border-border/40 bg-surface-strong/40">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-strong/60 px-3 py-1.5">
            <DollarSign className="h-4 w-4 text-body" />
            <span className="text-xs font-bold text-body uppercase tracking-wider">
              Vol
            </span>
            <span className="text-sm font-black text-[#162033] dark:text-heading tabular-nums">
              {formatCurrency(totalVolume)}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
            style={{ background: greenTone.bg, borderColor: greenTone.border }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: greenTone.text }} />
            <span className="text-xs font-bold" style={{ color: greenTone.text }}>
              {approvedCount} Approved
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-strong/80 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-bold text-body">
              {pendingCount} Pending
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
            style={{ background: redTone.bg, borderColor: redTone.border }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: redTone.text }} />
            <span className="text-xs font-bold" style={{ color: redTone.text }}>
              {rejectedCount} Rejected
            </span>
          </div>
        </div>

        {/* ── ERROR ──────────────────────────────────────────────── */}
        {error && (
          <div
            className="mx-5 sm:mx-7 mt-4 rounded-2xl border bg-surface-strong px-5 py-3.5 flex items-center gap-3"
            style={{ borderColor: redTone.border }}
          >
            <XCircle className="h-5 w-5 shrink-0" style={{ color: redTone.text }} />
            <p className="text-sm font-semibold" style={{ color: redTone.text }}>{error}</p>
          </div>
        )}

        {/* ── TABLE ──────────────────────────────────────────────── */}
        <div
          ref={tableTopRef}
          className="flex-1 px-5 sm:px-7 pt-4 pb-5 overflow-x-auto"
        >
          {currentTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-strong/70 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-strong">
                <Hash className="h-5 w-5 text-accent" />
              </div>
              <p className="text-base font-bold text-[#162033] dark:text-heading">
                No transactions found
              </p>
              <p className="mt-1 text-sm text-body">
                Try adjusting the filter above.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[54px]" />
                  <col className="w-[126px]" />
                  <col className="hidden sm:table-column sm:w-[40%]" />
                  <col className="w-[132px] sm:w-[150px]" />
                  <col className="hidden sm:table-column sm:w-[132px]" />
                  <col className="hidden md:table-column md:w-[148px]" />
                </colgroup>
                {/* HEAD */}
                <thead>
                  <tr className="bg-surface-strong border-b border-border">
                    <th className="px-4 sm:px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body">
                      #
                    </th>
                    <th className="px-3 sm:px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body">
                      Type
                    </th>
                    <th className="px-3 sm:px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body hidden sm:table-cell">
                      Client
                    </th>
                    <th className="px-3 sm:px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body">
                      Amount
                    </th>
                    <th className="px-3 sm:px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body text-center hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 sm:px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-body text-right hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {currentTransactions.map((transaction, index) => {
                    const typeConfig = getTypeConfig(transaction.type);
                    const statusConfig = getStatusConfig(transaction.status);
                    const rowNumber = startIndex + index + 1;

                    return (
                      <tr
                        key={transaction.id}
                        onClick={() => setSelectedTransaction(transaction)}
                        className={`group cursor-pointer border-b border-border/60 transition-colors duration-150 ${
                          index % 2 === 0
                            ? "bg-surface-strong/70 hover:bg-surface-strong"
                            : "bg-surface-strong/60 hover:bg-surface-strong"
                        } active:bg-surface-strong`}
                      >
                        {/* Row number */}
                        <td className="px-4 sm:px-5 py-4 align-middle">
                          <span className="text-sm font-semibold text-accent tabular-nums">
                            {rowNumber}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-3 sm:px-4 py-4 align-middle">
                          <div
                            className="inline-flex min-w-[98px] justify-center rounded-lg border px-3 py-1.5 text-sm font-bold leading-none"
                            style={{
                              background: typeConfig.tone.bg,
                              borderColor: typeConfig.tone.border,
                              color: typeConfig.tone.text,
                            }}
                          >
                            {transaction.type}
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-3 sm:px-4 py-4 align-middle hidden sm:table-cell">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                              style={{
                                background: typeConfig.tone.bg,
                                color: typeConfig.tone.text,
                              }}
                            >
                              {transaction.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[15px] font-semibold text-[#162033] dark:text-heading truncate max-w-[140px] sm:max-w-[180px]">
                                {transaction.user.name}
                              </p>
                              <p className="text-xs text-body truncate max-w-[140px] sm:max-w-[180px] flex items-center gap-1">
                                <Mail className="h-3 w-3 shrink-0" />
                                {transaction.user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-3 sm:px-4 py-4 align-middle">
                          <span
                            className="text-base sm:text-lg font-black tracking-tight tabular-nums"
                            style={{ color: typeConfig.tone.text }}
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 sm:px-4 py-4 text-center align-middle hidden sm:table-cell">
                          <span
                            className="inline-flex min-w-[92px] justify-center rounded-full border px-3 py-1.5 text-xs font-bold leading-none"
                            style={{
                              background: statusConfig.tone.bg,
                              borderColor: statusConfig.tone.border,
                              color: statusConfig.tone.text,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 sm:px-5 py-4 text-right align-middle hidden md:table-cell">
                          <span className="text-sm font-semibold text-body whitespace-nowrap">
                            {transaction.displayDate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PAGINATION ─────────────────────────────────────── */}
          {sortedTransactions.length > itemsPerPage && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface-strong/60 px-4 sm:px-5 py-3">
              <div className="text-sm font-semibold text-body">
                {startIndex + 1}–{Math.min(endIndex, sortedTransactions.length)}{" "}
                of {sortedTransactions.length}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-border bg-surface-strong p-2 text-body transition hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1),
                  )
                  .map((page, idx, arr) => {
                    const gap = idx > 0 && page > arr[idx - 1] + 1;
                    return (
                      <React.Fragment key={`p-${page}`}>
                        {gap && (
                          <span className="px-1 text-xs tracking-widest text-accent">
                            ···
                          </span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={`min-w-[34px] rounded-lg px-2 py-2 text-sm font-bold tabular-nums transition ${
                            currentPage === page
                              ? "bg-[#162033] text-heading shadow-sm"
                              : "border border-border bg-surface-strong text-heading hover:bg-surface-strong"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-border bg-surface-strong p-2 text-body transition hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TRANSACTION DETAIL MODAL
          Rendered through a portal straight into document.body: this
          card's ancestors (.admin-surface, here and in AdminDashboard)
          use backdrop-filter, which creates a CSS containing block for
          any `position: fixed` descendant. Left in place, the "fixed"
          overlay actually positions relative to that ancestor instead
          of the viewport — it looks fine until the page scrolls, at
          which point the real modal (and its close button) drifts away
          from where it's rendered, so clicks on "X"/"Close Details"
          silently miss. Porting to body sidesteps that entirely.
          ════════════════════════════════════════════════════════════ */}
      {selectedTransaction && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTransaction(null);
          }}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-border bg-background shadow-[0_30px_60px_rgba(0,0,0,0.18),0_12px_24px_rgba(116,93,56,0.15)] animate-in zoom-in-95 duration-150 border-l-[5px]"
            style={{ borderLeftColor: getTypeConfig(selectedTransaction.type).tone.text }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 rounded-xl border border-border bg-surface-strong p-2 text-body shadow-sm transition hover:bg-surface-strong hover:text-[#162033] dark:text-heading z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal header */}
            <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-border/60">
              {(() => {
                const tc = getTypeConfig(selectedTransaction.type);
                const sc = getStatusConfig(selectedTransaction.status);
                const TIcon = tc.icon;
                const SIcon = sc.icon;
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold"
                        style={{
                          background: tc.tone.bg,
                          borderColor: tc.tone.border,
                          color: tc.tone.text,
                        }}
                      >
                        <TIcon className="h-4 w-4" />
                        {selectedTransaction.type}
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: sc.dotColor }}
                        />
                        <SIcon className="h-4 w-4" style={{ color: sc.tone.text }} />
                        <span className="text-sm font-bold" style={{ color: sc.tone.text }}>
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                        Amount
                      </p>
                      <p
                        className="text-[2.5rem] sm:text-[3rem] font-black leading-none tracking-[-0.05em] mt-1"
                        style={{ color: tc.tone.text }}
                      >
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                      <p className="text-sm font-semibold text-body mt-1">
                        {selectedTransaction.displayDate}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal body */}
            <div className="px-6 sm:px-7 py-5 space-y-4">
              <div className="rounded-2xl border border-border bg-surface-strong/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Client
                  </span>
                </div>
                <p className="text-base font-bold text-[#162033] dark:text-heading">
                  {selectedTransaction.user.name}
                </p>
                <p className="text-sm text-body flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedTransaction.user.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-surface-strong/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Account
                    </span>
                  </div>
                  <p className="text-sm font-bold font-mono text-[#162033] dark:text-heading break-all">
                    {selectedTransaction.account}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface-strong/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Method
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#162033] dark:text-heading">
                    {selectedTransaction.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-strong/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Transaction ID
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-heading break-all">
                  {selectedTransaction.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full rounded-2xl border border-border bg-surface-strong py-3 text-sm font-bold text-heading transition hover:bg-surface-strong hover:text-[#162033] dark:text-heading hover:border-accent shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
