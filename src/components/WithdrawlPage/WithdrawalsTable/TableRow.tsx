import { memo } from "react";
import type { Withdrawal } from "@/types/WithdrawalPage.types";
import { StatusBadge } from "./StatusBadge";

interface TableRowProps {
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

export const TableRow = memo(({ withdrawal }: TableRowProps) => {
  return (
    <tr className="transition-colors hover:bg-surface-strong/[0.03]">
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-mono text-sm text-heading">
          {getAccountLabel(withdrawal.account)}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-heading">
        {getMethodLabel(withdrawal.method)}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-heading">
        {withdrawal.amount}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{withdrawal.dateInitiated}</span>
          <span className="text-xs text-subtle">{withdrawal.initiatedtime}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{withdrawal.processedDate || "-"}</span>
          <span className="text-xs text-subtle">{withdrawal.processedtime}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <StatusBadge status={withdrawal.status} />
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";
