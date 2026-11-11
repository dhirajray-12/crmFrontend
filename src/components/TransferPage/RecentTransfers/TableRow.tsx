import { memo } from "react";
import type { Transfer } from "@/types/transfer.types";
import { formatCurrency, formatDate } from "@/utils/TransferHelper";
import { StatusBadge } from "./StatusBadge";

interface TableRowProps {
  transfer: Transfer;
}

export const TableRow = memo(({ transfer }: TableRowProps) => {
  return (
    <tr className="transition-colors hover:bg-surface-strong/[0.03]">
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-mono text-sm text-heading">
          {transfer.fromAccount?.mt5Account ?? "N/A"}
        </span>
        <p className="text-xs text-subtle">
          {transfer.fromAccount?.accountType ?? "N/A"}
        </p>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-mono text-sm text-heading">
          {transfer.toAccount?.mt5Account ?? "N/A"}
        </span>
        <p className="text-xs text-subtle">
          {transfer.toAccount?.accountType ?? "N/A"}
        </p>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-heading">
        {formatCurrency(transfer.amount)}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-subtle">
        {formatDate(transfer.createdAt)}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <StatusBadge status={transfer.status} />
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";
