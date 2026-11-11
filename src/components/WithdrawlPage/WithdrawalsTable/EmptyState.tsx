import { TrendingDown } from "lucide-react";

export const EmptyState = () => {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-strong/[0.03]">
            <TrendingDown className="h-6 w-6 text-subtle" />
          </div>
          <div>
            <p className="text-sm font-semibold text-heading">No withdrawals found</p>
            <p className="mt-1 text-xs text-subtle">
              Try adjusting your filters or submit a new withdrawal.
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
};
