import React, { forwardRef, memo } from "react";
import { History } from "lucide-react";
import type { Transaction } from "@/types/TransactionHistory.type";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { MobileTransactionCard } from "./MobileTransactionCard";
import { LoadingState } from "./LoadingState";

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-strong/[0.03]">
      <History className="h-6 w-6 text-subtle" />
    </div>
    <div>
      <p className="text-sm font-semibold text-heading">No transactions found</p>
      <p className="mt-1 text-xs text-subtle">
        Try adjusting your search or filters to see more results.
      </p>
    </div>
  </div>
);

export const TransactionsTable = memo(
  forwardRef<HTMLDivElement, TransactionsTableProps>(
    ({ transactions, loading, onScroll }, ref) => {
      if (loading) {
        return <LoadingState />;
      }

      if (transactions.length === 0) {
        return <EmptyState />;
      }

      return (
        <>
          <div ref={ref} onScroll={onScroll} className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <TableHeader />
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <TableRow key={tx.id} transaction={tx} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 px-4 pb-4 md:hidden">
            {transactions.map((tx) => (
              <MobileTransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </>
      );
    },
  ),
);

TransactionsTable.displayName = "TransactionsTable";
