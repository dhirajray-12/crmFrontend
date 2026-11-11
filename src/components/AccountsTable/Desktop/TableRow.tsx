import React, { memo } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Pill } from "@/pages/ClientPage/DashboardComponents/ui/Pill";
import { formatDate } from "@/utils/accountUtils";
import type { AccountTableRowProps } from "@/types/accounts.types";

// Helper to format currency
const formatCurrency = (value: number): string => {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const TableRow: React.FC<AccountTableRowProps> = memo(
  ({ account, onDepositClick, onWithdrawClick }) => {
    const displayAccountNumber = account.accountNumber || account.mt5Account || "N/A";
    const isEcn = account.accountType === "ECN";

    return (
      <tr className="transition-colors hover:bg-surface-strong/[0.03]">
        <td className="px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-heading">
              {displayAccountNumber}
            </div>
            <div className="mt-0.5 text-xs text-subtle">
              {account.platform || "MT5"} account
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <Pill tone={isEcn ? "amber" : "sky"}>{account.accountType}</Pill>
        </td>
        <td className="px-4 py-3 font-mono text-sm tabular-nums text-subtle">
          {account.leverage}
        </td>
        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
          {formatCurrency(account.balance)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm tabular-nums text-accent">
          {formatCurrency(account.equity)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-subtle">
          {formatDate(account.createdAt)}
        </td>
        <td className="px-4 py-3">
          <Pill tone={account.status ? "emerald" : "neutral"} dot={account.status}>
            {account.status ? "Active" : "Inactive"}
          </Pill>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={onDepositClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-400/15"
              title="Deposit"
              type="button"
            >
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Deposit
            </button>
            <button
              onClick={onWithdrawClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-400/15"
              title="Withdraw"
              type="button"
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              Withdraw
            </button>
          </div>
        </td>
      </tr>
    );
  },
);

TableRow.displayName = "TableRow";
