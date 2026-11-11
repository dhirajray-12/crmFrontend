import type { Copier } from "@/types/MasterPage.type";
import { Users } from "lucide-react";
import { CopierRow } from "./CopierRow";
import { formatCurrency } from "@/utils/MasterPage.helper";

interface CopiersTableProps {
  copiers: Copier[];
  masterNickname: string;
}

export const CopiersTable = ({ copiers }: CopiersTableProps) => {
  if (copiers.length === 0) {
    return (
      <div className="py-8 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-heading/20" />
        <p className="text-subtle">No copiers yet</p>
        <p className="mt-1 text-sm text-subtle">
          Share your strategy to attract copiers
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead className="border-b border-border bg-surface-strong/[0.04]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Account
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Profit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Commission Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {copiers.map((copier, idx) => (
              <CopierRow key={idx} copier={copier} index={idx} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 sm:hidden">
        {copiers.map((copier, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-surface-strong/[0.03] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-heading">
                {copier.copierUserId.firstname} {copier.copierUserId.lastname}
              </p>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {copier.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-subtle">
              {copier.copierAccountId.accountNumber}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-subtle">Balance</p>
                <p className="font-medium text-heading">
                  {formatCurrency(copier.copierAccountId.balance)}
                </p>
              </div>
              <div>
                <p className="text-subtle">Profit</p>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(copier.currentProfit)}
                </p>
              </div>
              <div>
                <p className="text-subtle">Commission</p>
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {formatCurrency(copier.totalCommissionPaid)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
