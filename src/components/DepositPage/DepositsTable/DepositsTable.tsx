import type { DepositData } from "@/types/depositePage.types";
import { TableRow } from "./TableRow";
import { MobileDepositCard } from "./MobileDepositCard";
import { EmptyState } from "./EmptyState";

interface DepositsTableProps {
  data: DepositData[];
  loading: boolean;
}

export const DepositsTable = ({ data, loading }: DepositsTableProps) => {
  if (loading) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 text-subtle">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent/70 border-t-transparent" />
            <p className="text-sm font-medium">Loading deposits...</p>
          </div>
        </td>
      </tr>
    );
  }

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {data.map((deposit, index) => (
        <TableRow key={deposit._id ?? deposit.id ?? index} deposit={deposit} />
      ))}
    </>
  );
};

export const MobileDepositsList = ({ data, loading }: DepositsTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-14 text-subtle">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent/70 border-t-transparent" />
        <span className="text-sm font-medium">Loading deposits...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-14 text-center">
        <p className="text-sm font-semibold text-heading">No deposits found</p>
        <p className="text-xs text-subtle">
          Try adjusting your filters or submit a new deposit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      {data.map((deposit, index) => (
        <MobileDepositCard
          key={deposit._id ?? deposit.id ?? index}
          deposit={deposit}
        />
      ))}
    </div>
  );
};
