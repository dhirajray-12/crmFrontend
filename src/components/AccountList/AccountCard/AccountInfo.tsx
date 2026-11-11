import { memo } from "react";
import type { Account } from "@/types/Accountlist.type";
import { getAccountTypeColor } from "@/utils/AccountListHelper";

interface AccountInfoProps {
  account: Account;
}

export const AccountInfo = memo(({ account }: AccountInfoProps) => {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-linear-to-br text-base font-bold text-heading sm:h-12 sm:w-12 sm:text-lg ${getAccountTypeColor(
          account.accountType,
        )}`}
      >
        {account.accountType.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-heading sm:text-lg">
            {account.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              account.status === "Active"
                ? "border border-emerald-400/20 bg-emerald-500/[0.14] text-emerald-700 dark:text-emerald-200"
                : "border border-rose-400/20 bg-rose-500/[0.14] text-rose-700 dark:text-rose-200"
            }`}
          >
            {account.status}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-subtle">
          <span className="rounded-md border border-border bg-surface-strong/[0.03] px-2 py-0.5 font-mono">
            {account.accountNumber}
          </span>
          <span className="rounded-md border border-border bg-surface-strong/[0.03] px-2 py-0.5">
            {account.accountType}
          </span>
          <span className="hidden rounded-md border border-border bg-surface-strong/[0.03] px-2 py-0.5 sm:inline">
            Lev. {account.leverage}
          </span>
        </div>
      </div>
    </div>
  );
});

AccountInfo.displayName = "AccountInfo";
