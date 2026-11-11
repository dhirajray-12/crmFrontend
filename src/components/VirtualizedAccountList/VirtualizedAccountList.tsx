import type { Account } from "@/types/Accountlist.type";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

interface VirtualizedAccountListProps {
  accounts: Account[];
  onAccountClick?: (account: Account) => void;
  height?: number;
  itemHeight?: number;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
}

const LoadingMoreIndicator = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <span className="ml-2 text-sm text-subtle">Loading more...</span>
  </div>
);

export const VirtualizedAccountList = ({
  accounts,
  onAccountClick,
  height = 600,
  itemHeight = 80,
  onLoadMore,
  hasNextPage = false,
  isLoadingMore = false,
}: VirtualizedAccountListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: accounts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // 🔥 Infinite scroll logic
  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= accounts.length - 3 && // near bottom
      hasNextPage &&
      !isLoadingMore &&
      onLoadMore
    ) {
      onLoadMore();
    }
  }, [virtualItems, accounts.length, hasNextPage, isLoadingMore, onLoadMore]);

  if (accounts.length === 0) {
    return (
      <div className="bg-surface-strong rounded-lg shadow overflow-hidden">
        <div className="sticky top-0 bg-surface px-6 py-3 border-b border-border">
          <h3 className="font-semibold text-heading">Accounts (0)</h3>
        </div>
        <div className="flex justify-center items-center py-12">
          <p className="text-subtle">No accounts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-strong rounded-lg shadow overflow-hidden">
      <div className="sticky top-0 bg-surface px-6 py-3 border-b border-border z-10">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-heading">
            Accounts ({accounts.length})
          </h3>
        </div>
      </div>

      <div
        ref={parentRef}
        style={{ height, overflow: "auto" }}
        className="relative"
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const account = accounts[virtualRow.index];
            if (!account) return null;

            return (
              <div
                key={account.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-border hover:bg-surface cursor-pointer"
                onClick={() => onAccountClick?.(account)}
              >
                <div className="px-6 py-4 flex justify-between">
                  <div>
                    <p className="font-semibold text-heading">
                      {account.name}
                    </p>
                    <p className="text-sm text-subtle">
                      {account.accountNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${account.balance.toLocaleString()}
                    </p>
                    <p className="text-sm text-subtle">
                      {account.accountType}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isLoadingMore && <LoadingMoreIndicator />}
      </div>
    </div>
  );
};
