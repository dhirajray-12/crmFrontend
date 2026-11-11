import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  ReceiptText,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTransactions } from "@/hooks/useTransferTransactions";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";
import { Pill, type PillTone } from "./ui/Pill";
import { cn } from "@/lib/utils";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(value?: string) {
  if (!value) {
    return {
      date: "N/A",
      time: "",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: value,
      time: "",
    };
  }

  const timeZone = getConfiguredTimezone();

  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone,
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }),
  };
}

function getProcessedTime(transaction: {
  status: string;
  timetaken?: string;
  type?: string;
}) {
  if (transaction.status === "Pending") {
    return {
      date: "Processing",
      time: "",
    };
  }

  if (normalizeType(transaction.type || "") === "transfer") {
    return {
      date: "Instant",
      time: "",
    };
  }

  if (transaction.timetaken && transaction.timetaken !== "Pending") {
    const normalizedTimeTaken = transaction.timetaken
      .toLowerCase()
      .replace(/\s+/g, "");

    if (
      normalizedTimeTaken === "0d0h0m" ||
      normalizedTimeTaken === "0h0m0s" ||
      normalizedTimeTaken === "0h0m" ||
      normalizedTimeTaken === "0m0s" ||
      normalizedTimeTaken === "0m" ||
      normalizedTimeTaken === "0s"
    ) {
      return {
        date: "Instant",
        time: "",
      };
    }

    return {
      date: transaction.timetaken,
      time: "",
    };
  }

  return {
    date: "Awaiting update",
    time: "",
  };
}

function normalizeType(type: string) {
  return String(type || "").toLowerCase();
}

function getAccountLabel(account: unknown) {
  if (typeof account === "string") {
    return account;
  }

  if (account && typeof account === "object") {
    const candidate = account as {
      mt5Account?: string;
      accountNumber?: string;
      login?: string;
      account?: string;
    };

    return String(
      candidate.mt5Account ||
        candidate.accountNumber ||
        candidate.login ||
        candidate.account ||
        "N/A",
    );
  }

  return "N/A";
}

function getPaymentMethodLabel(transaction: {
  description?: string;
  details?: string;
  transactionType?: string;
  method?: string;
  paymentMethod?: string;
  gateway?: string;
  type: string;
}) {
  const lookup =
    `${transaction.description || ""} ${transaction.details || ""} ${transaction.transactionType || ""} ${transaction.method || ""} ${transaction.paymentMethod || ""} ${transaction.gateway || ""}`.toLowerCase();
  const hasWallet = lookup.includes("wallet") || lookup.includes("crypto");
  const hasBank = lookup.includes("bank");

  if (hasWallet && !hasBank) {
    return "Wallet";
  }

  if (hasBank && !hasWallet) {
    return "Bank";
  }

  if (hasWallet && hasBank) {
    return normalizeType(transaction.type) === "deposit" ? "Bank" : "Wallet";
  }

  return normalizeType(transaction.type) === "deposit" ? "Wallet" : "Bank";
}

function TypeBadge({ type }: { type: string }) {
  const normalizedType = normalizeType(type);
  const isDeposit = normalizedType === "deposit";
  const isWithdrawal = normalizedType === "withdrawal";

  return (
    <Pill
      tone={isDeposit ? "sky" : isWithdrawal ? "rose" : "neutral"}
      icon={isDeposit ? ArrowDownLeft : isWithdrawal ? ArrowUpRight : CreditCard}
    >
      {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
    </Pill>
  );
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; tone: PillTone }> = {
  Success: { icon: CheckCircle2, tone: "emerald" },
  Pending: { icon: Clock3, tone: "amber" },
  Failed: { icon: XCircle, tone: "rose" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { icon: AlertCircle, tone: "neutral" as const };

  return (
    <Pill tone={config.tone} icon={config.icon}>
      {status}
    </Pill>
  );
}

function EmptyRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <tr key={`empty-row-${index}`} className="pointer-events-none">
          <td className="h-[73px] px-4 py-3" colSpan={7} />
        </tr>
      ))}
    </>
  );
}

export default function TransactionsTable() {
  const { transactions, loading, error, fetchTransactions } = useTransactions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const rows = [...transactions].sort((a, b) => {
    const left = new Date(b.rawDate || b.date).getTime();
    const right = new Date(a.rawDate || a.date).getTime();

    return left - right;
  });
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + itemsPerPage);
  const emptyRowCount = Math.max(0, itemsPerPage - currentRows.length);

  const depositCount = rows.filter(
    (transaction) => normalizeType(transaction.type) === "deposit",
  ).length;
  const totalVolume = rows.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };
  const pageItems: Array<number | "left-ellipsis" | "right-ellipsis"> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdgePage = page === 1 || page === totalPages;
    const isNearCurrent = page >= currentPage - 1 && page <= currentPage + 1;

    if (isEdgePage || isNearCurrent) {
      pageItems.push(page);
      continue;
    }

    if (page === currentPage - 2) {
      pageItems.push("left-ellipsis");
    }

    if (page === currentPage + 2) {
      pageItems.push("right-ellipsis");
    }
  }

  const Pagination = () => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-subtle">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent p-1.5 text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageItems.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                className={cn(
                  "min-w-8 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors",
                  currentPage === item
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-border bg-transparent text-subtle hover:border-border hover:text-heading",
                )}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-body">
                …
              </span>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent p-1.5 text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  if (loading && rows.length === 0) {
    return (
      <Panel className="flex h-56 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionHeader
        eyebrow="Cashflow log"
        icon={ReceiptText}
        title="Recent transactions"
        description="Live transaction history and pagination"
        action={
          <button
            type="button"
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="p-4 sm:p-5">
        <StatRow columns={3}>
          <StatCell label="Total" value={rows.length} />
          <StatCell label="Deposits" value={depositCount} />
          <StatCell label="Volume" value={formatCurrency(totalVolume)} />
        </StatRow>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {currentRows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-strong/[0.03] px-4 py-10 text-center text-sm text-subtle">
            No transactions found.
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="mt-4 space-y-2 md:hidden">
              {currentRows.map((transaction) => {
                const isDeposit = normalizeType(transaction.type) === "deposit";
                const paymentMethod = getPaymentMethodLabel(transaction);
                const accountLabel = getAccountLabel(transaction.account);
                const initiated = formatDateTime(
                  transaction.rawDate || transaction.createdAt || transaction.date,
                );
                const processed = getProcessedTime(transaction);

                return (
                  <div
                    key={transaction.id}
                    className="rounded-xl border border-border bg-surface-strong/[0.03] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-heading">{accountLabel}</p>
                        <p className="mt-0.5 text-xs text-subtle">
                          {transaction.accountType || "Primary account"}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 font-mono text-sm font-semibold tabular-nums",
                          isDeposit ? "text-accent" : "text-rose-700 dark:text-rose-300",
                        )}
                      >
                        {isDeposit ? "+" : "-"}
                        {formatCurrency(Math.abs(Number(transaction.amount)))}
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <TypeBadge type={transaction.type} />
                      <StatusBadge status={transaction.status} />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-subtle">
                      <span>{paymentMethod}</span>
                      <span>
                        {initiated.date} {initiated.time}
                      </span>
                    </div>
                    {processed.date && (
                      <div className="mt-1 text-xs text-body">Processed: {processed.date}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border md:block">
              <table className="min-w-full text-left">
                <thead className="bg-surface-strong/[0.03]">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Account
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Method
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Type
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Processed
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {currentRows.map((transaction) => {
                    const isDeposit = normalizeType(transaction.type) === "deposit";
                    const paymentMethod = getPaymentMethodLabel(transaction);
                    const accountLabel = getAccountLabel(transaction.account);
                    const initiated = formatDateTime(
                      transaction.rawDate || transaction.createdAt || transaction.date,
                    );
                    const processed = getProcessedTime(transaction);

                    return (
                      <tr key={transaction.id} className="transition-colors hover:bg-surface-strong/[0.03]">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-heading">{accountLabel}</div>
                          <div className="text-xs text-subtle">
                            {transaction.accountType || "Primary account"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-subtle">
                            {paymentMethod === "Wallet" ? (
                              <Wallet className="h-3.5 w-3.5 text-subtle" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5 text-subtle" />
                            )}
                            {paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TypeBadge type={transaction.type} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "font-mono text-sm font-semibold tabular-nums",
                              isDeposit ? "text-accent" : "text-rose-700 dark:text-rose-300",
                            )}
                          >
                            {isDeposit ? "+" : "-"}
                            {formatCurrency(Math.abs(Number(transaction.amount)))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-heading">{initiated.date}</div>
                          <div className="text-xs text-subtle">{initiated.time}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-subtle">{processed.date}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={transaction.status} />
                        </td>
                      </tr>
                    );
                  })}
                  <EmptyRows count={emptyRowCount} />
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <Pagination />
        </div>
      </div>
    </Panel>
  );
}
