import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Landmark, ListChecks, Loader2, Wallet } from "lucide-react";

import type { AccountListItem } from "@/hooks/useAccountsData";
import { MobileAccountList } from "@/components/AccountsTable/Mobile/MobileAccountList";
import { DesktopTable } from "@/components/AccountsTable/Desktop/DesktopTable";
import { EmptyState } from "@/components/AccountsTable/Shared/EmptyState";
import { sortAccountsByDate } from "@/utils/accountUtils";
import { useAccountsStore } from "@/Store/accountsStore";
import { Panel } from "@/pages/ClientPage/DashboardComponents/ui/Panel";
import { SectionHeader } from "@/pages/ClientPage/DashboardComponents/ui/SectionHeader";
import { StatCell, StatRow } from "@/pages/ClientPage/DashboardComponents/ui/StatTile";
import { cn } from "@/lib/utils";

interface AccountsTableContentProps {
  accounts: AccountListItem[];
  isLoading?: boolean;
}

export const AccountsTableContent: React.FC<AccountsTableContentProps> = ({
  accounts,
  isLoading = false,
}) => {
  const { setOpenDepositModal, setOpenWithdrawModal } = useAccountsStore();
  const sortedAccounts = sortAccountsByDate(accounts);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleDepositClick = useCallback(() => {
    setOpenDepositModal(true);
  }, [setOpenDepositModal]);

  const handleWithdrawClick = useCallback(() => {
    setOpenWithdrawModal(true);
  }, [setOpenWithdrawModal]);

  const totalPages = Math.max(1, Math.ceil(sortedAccounts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = sortedAccounts.slice(
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

  const pageItems: Array<number | "left-ellipsis" | "right-ellipsis"> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdgePage = page === 1 || page === totalPages;
    const isNearCurrent = page >= currentPage - 1 && page <= currentPage + 1;

    if (isEdgePage || isNearCurrent) {
      pageItems.push(page);
      continue;
    }

    if (page === currentPage - 2) {
      pageItems.push("left-ellipsis");
    }

    if (page === currentPage + 2) {
      pageItems.push("right-ellipsis");
    }
  }

  if (isLoading) {
    return (
      <Panel className="flex h-56 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionHeader
        eyebrow="Accounts hub"
        icon={Landmark}
        title="Trading accounts"
        description="Balances, leverage, and quick actions for every account"
        action={
          <span className="text-xs text-subtle">
            Page {currentPage} of {totalPages}
          </span>
        }
      />

      <div className="p-4 sm:p-5">
        <StatRow columns={3}>
          <StatCell label="Total accounts" icon={Wallet} value={sortedAccounts.length} />
          <StatCell label="Visible on page" icon={ListChecks} value={paginatedAccounts.length} />
          <StatCell label="Current page" icon={Landmark} value={currentPage} />
        </StatRow>

        {sortedAccounts.length === 0 ? (
          <div className="mt-4">
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="mt-4 md:hidden">
              <MobileAccountList
                accounts={paginatedAccounts}
                onDepositClick={handleDepositClick}
                onWithdrawClick={handleWithdrawClick}
              />
            </div>

            {/* Desktop: table */}
            <div className="mt-4 hidden md:block">
              <DesktopTable
                accounts={paginatedAccounts}
                itemsPerPage={itemsPerPage}
                onDepositClick={handleDepositClick}
                onWithdrawClick={handleWithdrawClick}
              />
            </div>
          </>
        )}

        {sortedAccounts.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-subtle">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, sortedAccounts.length)} of{" "}
              {sortedAccounts.length}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent p-1.5 text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="hidden items-center gap-1 sm:flex">
                {pageItems.map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      className={cn(
                        "min-w-8 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors",
                        currentPage === item
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-border bg-transparent text-subtle hover:border-border hover:text-heading",
                      )}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="px-1 text-body">
                      …
                    </span>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent p-1.5 text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
