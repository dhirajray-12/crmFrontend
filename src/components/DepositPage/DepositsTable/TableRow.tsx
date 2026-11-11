import { memo } from "react";
import type { DepositData } from "@/types/depositePage.types";
import { generateColorFromString } from "@/utils/helpers";
import { StatusBadge } from "@/components/DepositPage/common/StatusBadge";

interface TableRowProps {
  deposit: DepositData;
}

export const TableRow = memo(({ deposit }: TableRowProps) => {
  const colors = generateColorFromString(deposit.type);

  return (
    <tr className="transition-colors hover:bg-surface-strong/[0.03]">
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-mono text-sm text-heading">{deposit.account}</span>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
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
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-heading">
        {deposit.method}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-heading">
        ${deposit.amount.toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{deposit.dateInitiated}</span>
          <span className="text-xs text-subtle">{deposit.timeInitiated}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{deposit.dateProcessed}</span>
          <span className="text-xs text-subtle">{deposit.timeProcessed}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{deposit.timeTaken}</span>
          <span className="text-xs text-subtle">{deposit.days} days</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <StatusBadge status={deposit.status} />
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";
