import React from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Pill } from "@/pages/ClientPage/DashboardComponents/ui/Pill";
import { formatDate } from "@/utils/accountUtils";
import type { AccountListItem } from "@/hooks/useAccountsData";

// Helper to format currency
const formatCurrency = (value: number): string => {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface MobileAccountCardProps {
  account: AccountListItem;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const AccountCard: React.FC<MobileAccountCardProps> = ({
  account,
  onDepositClick,
  onWithdrawClick,
}) => {
  const displayAccountNumber =
    account.accountNumber || account.mt5Account || "N/A";
  const isEcn = account.accountType === "ECN";

  return (
    <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-sm font-semibold text-heading">
            {displayAccountNumber}
          </p>
          <p className="mt-0.5 text-xs text-subtle">
            {account.platform || "MT5"} account
          </p>
        </div>
        <Pill tone={account.status ? "emerald" : "neutral"} dot={account.status}>
          {account.status ? "Active" : "Inactive"}
        </Pill>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Pill tone={isEcn ? "amber" : "sky"}>{account.accountType}</Pill>
        <span className="font-mono text-xs tabular-nums text-subtle">
          Leverage {account.leverage}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-subtle">
            Balance
          </p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-subtle">
            Equity
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums text-accent">
            {formatCurrency(account.equity)}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-subtle">
        <span>Created</span>
        <span>{formatDate(account.createdAt)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={onDepositClick}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-400/15"
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          Deposit
        </button>
        <button
          onClick={onWithdrawClick}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-400/15"
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Withdraw
        </button>
      </div>
    </div>
  );
};
