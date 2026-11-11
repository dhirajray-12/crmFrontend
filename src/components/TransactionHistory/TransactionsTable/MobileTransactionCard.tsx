import type { Transaction } from "@/types/TransactionHistory.type";
import { AccountTypeBadge } from "../common/AccountTypeBadge";
import { StatusBadge } from "../common/StatusBadge";
import { AmountDisplay } from "../common/AmountDisplay";

interface MobileTransactionCardProps {
  transaction: Transaction;
}

export const MobileTransactionCard = ({ transaction }: MobileTransactionCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-heading">{transaction.account}</p>
          <p className="text-xs text-subtle">{transaction.transactionType}</p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <AccountTypeBadge type={transaction.type} />
        <span className="text-sm text-subtle">{transaction.description}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">Date</p>
          <p className="mt-1 text-sm text-heading">{transaction.date}</p>
          <p className="text-xs text-subtle">{transaction.timetaken}</p>
        </div>
        <AmountDisplay amount={transaction.amount} size="lg" />
      </div>
    </div>
  );
};
