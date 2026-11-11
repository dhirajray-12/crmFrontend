import { AccountTypeBadge } from "@/components/TransactionHistory/common/AccountTypeBadge";
import { AmountDisplay } from "@/components/TransactionHistory/common/AmountDisplay";
import { StatusBadge } from "@/components/TransactionHistory/common/StatusBadge";
import type { Transaction } from "@/types/TransactionHistory.type";
import { memo } from "react";

interface TableRowProps {
  transaction: Transaction;
}

export const TableRow = memo(({ transaction }: TableRowProps) => {
  return (
    <tr className="transition-colors hover:bg-surface-strong/[0.03]">
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-mono text-sm text-heading">{transaction.account}</span>
        <p className="text-xs text-subtle">{transaction.transactionType}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex items-center gap-2">
          <AccountTypeBadge type={transaction.type} />
          <span className="text-sm text-subtle">{transaction.description}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <AmountDisplay amount={transaction.amount} />
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-subtle">
        {transaction.date}
        <p className="text-xs text-subtle">{transaction.timetaken}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <StatusBadge status={transaction.status} />
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";
