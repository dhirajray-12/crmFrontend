import type { Account } from "@/types/Accountlist.type";

interface AccountStatsProps {
  account: Account;
}

const formatCurrency = (value: number | null | undefined): string => {
  const safeValue = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return `$${safeValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const AccountStats = ({ account }: AccountStatsProps) => {
  const isProfitPositive = account.profitLoss?.startsWith("+");

  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface-strong/[0.02]">
      <div className="px-2 py-2.5 text-center sm:px-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">
          Balance
        </p>
        <p
          className="mt-0.5 truncate text-xs font-semibold text-heading sm:text-sm"
          title={formatCurrency(account.balance)}
        >
          {formatCurrency(account.balance)}
        </p>
      </div>
      <div className="px-2 py-2.5 text-center sm:px-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">
          Equity
        </p>
        <p
          className="mt-0.5 truncate text-xs font-semibold text-heading sm:text-sm"
          title={formatCurrency(account.equity)}
        >
          {formatCurrency(account.equity)}
        </p>
      </div>
      <div className="px-2 py-2.5 text-center sm:px-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">
          P&L
        </p>
        <p
          className={`mt-0.5 truncate text-xs font-semibold sm:text-sm ${
            isProfitPositive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
          }`}
          title={account.profitLoss}
        >
          {account.profitLoss}
        </p>
      </div>
    </div>
  );
};
