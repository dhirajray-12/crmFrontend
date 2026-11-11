import type { DepositData } from "@/types/depositePage.types";
import { generateColorFromString } from "@/utils/helpers";
import { StatusBadge } from "@/components/DepositPage/common/StatusBadge";

interface MobileDepositCardProps {
  deposit: DepositData;
}

export const MobileDepositCard = ({ deposit }: MobileDepositCardProps) => {
  const colors = generateColorFromString(deposit.type);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Account
          </p>
          <p className="mt-1 font-mono text-sm text-heading">{deposit.account}</p>
        </div>
        <StatusBadge status={deposit.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }}
        >
          {deposit.type}
        </span>
        <span className="text-lg font-bold text-heading">
          ${deposit.amount.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Method
          </p>
          <p className="mt-1 text-heading">{deposit.method}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Turnaround
          </p>
          <p className="mt-1 text-heading">
            {deposit.timeTaken} · {deposit.days}d
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Initiated
          </p>
          <p className="mt-1 text-heading">{deposit.dateInitiated}</p>
          <p className="text-xs text-subtle">{deposit.timeInitiated}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Processed
          </p>
          <p className="mt-1 text-heading">{deposit.dateProcessed}</p>
          <p className="text-xs text-subtle">{deposit.timeProcessed}</p>
        </div>
      </div>
    </div>
  );
};
