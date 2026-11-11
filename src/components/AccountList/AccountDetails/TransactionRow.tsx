import type { Transaction } from "@/types/Accountlist.type";
import { getStatusColor } from "@/utils/AccountListHelper";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
interface TransactionRowProps {
  transaction: Transaction;
  index: number;
}

export const TransactionRow = ({ transaction, index }: TransactionRowProps) => {
  const iconMap: Record<string, LucideIcon> = {
    deposit: ArrowDownCircle,
    withdrawal: ArrowUpCircle,
    transfer: Activity,
  };
  const IconComponent = iconMap[transaction.type] || Activity;
  const statusColor = getStatusColor(transaction.status);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="transition-colors hover:bg-surface-strong/[0.04]"
    >
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <span
          className={`inline-flex items-center gap-1 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
            transaction.type === "deposit"
              ? "bg-emerald-500/[0.16] text-emerald-700 dark:text-emerald-200"
              : transaction.type === "withdrawal"
                ? "bg-rose-500/[0.16] text-rose-700 dark:text-rose-200"
                : "bg-accent/[0.16] text-accent"
          }`}
        >
          <IconComponent className="w-3 h-3" />
          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
        </span>
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <span
          className={`font-bold ${
            transaction.amount >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
          }`}
        >
          {transaction.amount >= 0 ? "+" : "-"}$
          {Math.abs(transaction.amount).toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-heading">{transaction.method}</td>
      <td className="px-6 py-4 text-sm text-subtle">
        <div>{transaction.date}</div>
        <div className="text-xs text-subtle">{transaction.timetaken}</div>
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </span>
      </td>
    </motion.tr>
  );
};
