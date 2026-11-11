// src/components/AccountsTable/Desktop/DesktopTable.tsx
import type { AccountListItem } from "@/hooks/useAccountsData";
import React from "react";
import { TableHeaders } from "./TableHeaders";
import { TableRow } from "./TableRow";

interface DesktopTableProps {
  accounts: AccountListItem[];
  itemsPerPage: number;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

const TABLE_HEADERS = [
  "Account",
  "Type",
  "Leverage",
  "Balance",
  "Equity",
  "Created",
  "Status",
  "Actions",
];

function EmptyRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <tr key={`empty-account-row-${index}`} className="pointer-events-none">
          <td className="h-[65px] px-4 py-3" colSpan={TABLE_HEADERS.length} />
        </tr>
      ))}
    </>
  );
}

export const DesktopTable: React.FC<DesktopTableProps> = ({
  accounts,
  itemsPerPage,
  onDepositClick,
  onWithdrawClick,
}) => {
  const emptyRowCount = Math.max(0, itemsPerPage - accounts.length);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[19%]" />
          <col className="w-[10%]" />
          <col className="w-[9%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[11%]" />
          <col className="w-[10%]" />
          <col className="w-[17%]" />
        </colgroup>
        <TableHeaders headers={TABLE_HEADERS} />
        <tbody className="divide-y divide-border">
          {accounts.map((account, idx) => (
            <TableRow
              key={account._id}
              account={account}
              index={idx}
              onDepositClick={onDepositClick}
              onWithdrawClick={onWithdrawClick}
            />
          ))}
          <EmptyRows count={emptyRowCount} />
        </tbody>
      </table>
    </div>
  );
};
