import { memo, useEffect, useState } from "react";
import { RefreshCw, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import type { Transaction } from "@/types/Accountlist.type";
import { TransactionRow } from "./TransactionRow";
import { TransactionMobileCard } from "./TransactionMobileCard";

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
}

export const TransactionsTable = memo(
  ({ transactions, loading }: TransactionsTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.max(
      1,
      Math.ceil((transactions?.length || 0) / itemsPerPage),
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = (transactions || []).slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    useEffect(() => {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [currentPage, totalPages]);

    const goToPage = (page: number) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-accent animate-spin" />
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-subtle">
            Loading transactions...
          </span>
        </div>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <Activity className="mx-auto mb-3 h-12 w-12 text-subtle sm:mb-4 sm:h-16 sm:w-16" />
          <p className="text-base text-subtle sm:text-lg">
            No transactions found
          </p>
          <p className="mt-2 text-xs text-subtle sm:text-sm">
            Transactions for this account will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2 sm:hidden">
          {paginatedTransactions.map((transaction, index) => (
            <TransactionMobileCard
              key={
                transaction.id ?? `${transaction.type}-${startIndex + index}`
              }
              transaction={transaction}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
          <table className="w-full min-w-160">
            <thead className="bg-surface-strong/[0.05]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-heading">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-heading">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-heading">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-heading">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-heading">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-transparent">
              {paginatedTransactions.map((transaction, index) => (
                <TransactionRow
                  key={
                    transaction.id ?? `${transaction.type}-${startIndex + index}`
                  }
                  transaction={transaction}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length > itemsPerPage && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-subtle">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, transactions.length)} of{" "}
              {transactions.length} transactions
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] p-2 text-subtle transition-colors hover:bg-surface-strong/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-full border border-border bg-surface-strong/[0.04] px-3 py-1 text-xs font-semibold text-heading">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] p-2 text-subtle transition-colors hover:bg-surface-strong/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

TransactionsTable.displayName = "TransactionsTable";
