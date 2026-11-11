import type { Withdrawal } from "@/types/WithdrawalPage.types";
import { TableRow } from "./TableRow";
import { MobileWithdrawalCard } from "./MobileWithdrawalCard";
import { EmptyState } from "./EmptyState";

interface WithdrawalsTableProps {
  data: Withdrawal[];
}

export const WithdrawalsTable = ({ data }: WithdrawalsTableProps) => {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {data.map((withdrawal) => (
        <TableRow key={withdrawal.id} withdrawal={withdrawal} />
      ))}
    </>
  );
};

export const MobileWithdrawalsList = ({ data }: WithdrawalsTableProps) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-14 text-center">
        <p className="text-sm font-semibold text-heading">No withdrawals found</p>
        <p className="text-xs text-subtle">
          Try adjusting your filters or submit a new withdrawal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      {data.map((withdrawal) => (
        <MobileWithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
      ))}
    </div>
  );
};
