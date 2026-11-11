import { ArrowRightLeft } from "lucide-react";

export const EmptyState = () => {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-strong/[0.03]">
            <ArrowRightLeft className="h-6 w-6 text-subtle" />
          </div>
          <div>
            <p className="text-sm font-semibold text-heading">
              No transfers found
            </p>
            <p className="mt-1 text-xs text-subtle">
              Try adjusting your filters to see more results.
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
};
