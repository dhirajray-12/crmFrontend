import { memo } from "react";
import type { Transfer } from "@/types/transfer.types";
import { TableRow } from "./TableRow";
import { MobileTransferCard } from "./MobileTransferCard";
import { EmptyState } from "./EmptyState";

interface TransfersListProps {
  transfers: Transfer[];
}

export const TransfersTable = memo(({ transfers }: TransfersListProps) => {
  if (transfers.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {transfers.map((transfer) => (
        <TableRow key={transfer._id} transfer={transfer} />
      ))}
    </>
  );
});

TransfersTable.displayName = "TransfersTable";

export const MobileTransfersList = memo(({ transfers }: TransfersListProps) => {
  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-14 text-center">
        <p className="text-sm font-semibold text-heading">
          No transfers found
        </p>
        <p className="text-xs text-subtle">
          Try adjusting your filters or start a new transfer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-6">
      {transfers.map((transfer) => (
        <MobileTransferCard key={transfer._id} transfer={transfer} />
      ))}
    </div>
  );
});

MobileTransfersList.displayName = "MobileTransfersList";
