import type { Transaction } from "@/types/Accountlist.type";
import { getStatusColor } from "@/utils/AccountListHelper";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface TransactionMobileCardProps {
  transaction: Transaction;
}

export const TransactionMobileCard = ({
  transaction,
}: TransactionMobileCardProps) => {
  const iconMap: Record<string, LucideIcon> = {
    deposit: ArrowDownCircle,
    withdrawal: ArrowUpCircle,
    transfer: Activity,
  };
  const IconComponent = iconMap[transaction.type] || Activity;
  const statusColor = getStatusColor(transaction.status);

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            transaction.type === "deposit"
              ? "bg-emerald-500/[0.16] text-emerald-700 dark:text-emerald-200"
              : transaction.type === "withdrawal"
                ? "bg-rose-500/[0.16] text-rose-700 dark:text-rose-200"
                : "bg-accent/[0.16] text-accent"
          }`}
        >
          <IconComponent className="h-3 w-3" />
          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
        </span>
        <span
          className={`text-sm font-bold ${
            transaction.amount >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
          }`}
        >
          {transaction.amount >= 0 ? "+" : "-"}$
          {Math.abs(transaction.amount).toFixed(2)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-subtle">
        <span className="truncate">{transaction.method}</span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-semibold ${statusColor}`}
        >
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </span>
      </div>

      <div className="mt-2 text-xs text-subtle">
        <div>{transaction.date}</div>
        <div className="text-body">{transaction.timetaken}</div>
      </div>
    </div>
  );
};
