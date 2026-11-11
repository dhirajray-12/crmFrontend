import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Activity } from "lucide-react";
import type {
  Account,
  Transaction,
  TransactionStats as TransactionStatsType,
} from "@/types/Accountlist.type";
import { TransactionStats } from "./TransactionStats";
import { TransactionsTable } from "./TransactionsTable";
import { memo } from "react";

interface AccountDetailsProps {
  account: Account | null;
  transactionStats: Record<string, TransactionStatsType>;
  accountTransactions: Record<string, Transaction[]>;
  loadingTransactions: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const AccountDetails = memo(
  ({
    account,
    transactionStats,
    accountTransactions,
    loadingTransactions,
    onClose,
    onRefresh,
  }: AccountDetailsProps) => {
    return (
      <AnimatePresence>
        {account && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-voice-scope="transaction modal"
            className="fixed inset-0 z-50 flex items-end justify-center bg-surface-strong backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface-strong shadow-2xl sm:max-h-[85vh] sm:max-w-3xl sm:rounded-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 shrink-0 text-accent" />
                    <h2 className="truncate text-base font-semibold text-heading sm:text-lg">
                      Transaction History
                    </h2>
                  </div>
                  <p className="mt-1 truncate text-xs text-subtle sm:text-sm">
                    {account?.name} &middot; {account?.accountNumber}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    className="rounded-lg border border-border bg-surface-strong/[0.05] p-2 text-subtle transition-all hover:bg-surface-strong/[0.1]"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.button>
                  <button
                    onClick={onClose}
                    data-voice-target="close transaction modal"
                    className="rounded-lg border border-border bg-surface-strong/[0.05] p-2 text-subtle transition-all hover:bg-rose-500/[0.14] hover:text-rose-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 sm:p-6">
                <TransactionStats
                  stats={
                    account
                      ? (transactionStats?.[account.accountNumber] ?? null)
                      : null
                  }
                />

                <TransactionsTable
                  transactions={
                    account
                      ? (accountTransactions?.[account.accountNumber] || [])
                      : []
                  }
                  loading={loadingTransactions}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

AccountDetails.displayName = "AccountDetails";
