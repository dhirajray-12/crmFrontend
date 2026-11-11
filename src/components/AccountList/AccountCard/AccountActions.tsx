import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { memo } from "react";

interface AccountActionsProps {
  accountId: number;
  onDeposit: (id: number) => void;
  onWithdrawal: (id: number) => void;
  menuComponent: React.ReactNode;
}

export const AccountActions = memo(
  ({
    accountId,
    onDeposit,
    onWithdrawal,
    menuComponent,
  }: AccountActionsProps) => {
    return (
      <div className="action-buttons flex w-full items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeposit(accountId);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.10] px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200 transition-colors hover:bg-emerald-500/[0.18]"
        >
          <ArrowDownLeft className="h-3.5 w-3.5" />
          Deposit
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWithdrawal(accountId);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-500/[0.10] px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-200 transition-colors hover:bg-rose-500/[0.18]"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Withdraw
        </button>
        {menuComponent}
      </div>
    );
  },
);
