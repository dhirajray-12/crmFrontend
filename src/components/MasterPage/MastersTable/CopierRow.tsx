import type { Copier } from "@/types/MasterPage.type";
import { formatCurrency } from "@/utils/MasterPage.helper";

interface CopierRowProps {
  copier: Copier;
  index: number;
}

export const CopierRow = ({ copier }: CopierRowProps) => {
  return (
    <tr className="border-t border-border transition-colors hover:bg-surface-strong/[0.04]">
      <td className="px-4 py-3 text-heading">
        {copier.copierUserId.firstname} {copier.copierUserId.lastname}
      </td>
      <td className="px-4 py-3 text-sm text-subtle">
        {copier.copierAccountId.accountNumber}
      </td>
      <td className="px-4 py-3 text-heading">
        {formatCurrency(copier.copierAccountId.balance)}
      </td>
      <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-300">
        {formatCurrency(copier.currentProfit)}
      </td>
      <td className="px-4 py-3 font-medium text-blue-700 dark:text-blue-300">
        {formatCurrency(copier.totalCommissionPaid)}
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {copier.status}
        </span>
      </td>
    </tr>
  );
};
