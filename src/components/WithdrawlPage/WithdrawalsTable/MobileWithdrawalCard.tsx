import type { Withdrawal } from "@/types/WithdrawalPage.types";
import { StatusBadge } from "./StatusBadge";

interface MobileWithdrawalCardProps {
  withdrawal: Withdrawal;
}

const getAccountLabel = (account: unknown) => {
  if (typeof account === "string" || typeof account === "number") {
    return String(account);
  }

  if (account && typeof account === "object") {
    const mt5Account = (account as { mt5Account?: unknown }).mt5Account;
    if (typeof mt5Account === "string" || typeof mt5Account === "number") {
      return String(mt5Account);
    }
  }

  return "N/A";
};

const getMethodLabel = (method: unknown) => {
  if (typeof method === "string") {
    return method;
  }

  if (method && typeof method === "object") {
    const candidate =
      (method as { type?: unknown; name?: unknown; method?: unknown }).type ??
      (method as { type?: unknown; name?: unknown; method?: unknown }).name ??
      (method as { type?: unknown; name?: unknown; method?: unknown }).method;

    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return "N/A";
};

export const MobileWithdrawalCard = ({ withdrawal }: MobileWithdrawalCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Account
          </p>
          <p className="mt-1 font-mono text-sm text-heading">
            {getAccountLabel(withdrawal.account)}
          </p>
        </div>
        <StatusBadge status={withdrawal.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
          {getMethodLabel(withdrawal.method)}
        </span>
        <span className="text-lg font-bold text-heading">{withdrawal.amount}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Initiated
          </p>
          <p className="mt-1 text-heading">{withdrawal.dateInitiated}</p>
          <p className="text-xs text-subtle">{withdrawal.initiatedtime}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Processed
          </p>
          <p className="mt-1 text-heading">{withdrawal.processedDate || "-"}</p>
          <p className="text-xs text-subtle">{withdrawal.processedtime}</p>
        </div>
      </div>
    </div>
  );
};
