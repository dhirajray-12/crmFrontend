import { Wallet } from "lucide-react";
import { usePaymentMethods } from "../../../hooks/useDepositData";
import { useDepositStore } from "@/Store/depositStore";
import { ErrorMessage } from "@/components/DepositModal/Shared/ErrorMessage";
import { LoadingSpinner } from "@/components/DepositModal/Shared/LoadingSpinner";
import { EmptyState } from "@/components/DepositModal/Shared/EmptyState";
import type { PaymentMethod } from "@/types/deposit.types";

export const WalletSelect: React.FC = () => {
  const { data, isLoading, error, refetch } = usePaymentMethods();
  const { setSelectedWallet, setStep } = useDepositStore();

  if (isLoading) return <LoadingSpinner message="Loading wallets..." />;
  if (error)
    return <ErrorMessage message="Failed to fetch wallets" onRetry={refetch} />;

  const wallets = data?.["Crypto Wallet"] || [];

  if (wallets.length === 0) {
    return (
      <EmptyState
        title="No active wallets available"
        message="Please contact support to add payment methods"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {wallets.map((wallet: PaymentMethod) => (
        <button
          key={wallet._id}
          onClick={() => {
            setSelectedWallet(wallet);
            setStep("walletDetails");
          }}
          data-voice-target={`wallet ${wallet.walletName}`}
          className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-strong/[0.04] sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-500/10">
                <Wallet className="h-4 w-4 text-violet-700 dark:text-violet-300" />
              </div>
              <h3 className="truncate text-sm font-bold text-heading">
                {wallet.walletName}
              </h3>
            </div>
            <span
              className={`inline-flex flex-shrink-0 items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                wallet.active
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {wallet.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-subtle">
            Digital wallet for secure crypto transactions
          </p>
        </button>
      ))}
    </div>
  );
};
