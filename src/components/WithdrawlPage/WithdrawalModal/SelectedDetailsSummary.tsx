import type { Account } from "@/types/WithdrawalPage.types";

interface SelectedDetailsSummaryProps {
  selectedAccount: Account | null;
  amount: string;
  method: string;
  walletType?: string;
}

export const SelectedDetailsSummary = ({
  selectedAccount,
  amount,
  method,
  walletType,
}: SelectedDetailsSummaryProps) => {
  if (!selectedAccount) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-strong/[0.05] p-4 sm:rounded-2xl sm:p-6">
      <h4 className="mb-2 text-base font-bold text-heading sm:mb-3 sm:text-lg">
        Selected Details
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-subtle">Account Number</p>
          <p className="font-mono text-lg font-bold text-heading">
            {selectedAccount.accountNumber}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-subtle">Account Type</p>
          <p className="text-lg font-bold text-heading">
            {selectedAccount.accountType}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-subtle">
            Withdrawal Amount
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">${amount || "0"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-subtle">Method</p>
          <p className="text-lg font-bold text-heading">
            {method === "E-Wallet"
              ? `E-Wallet${walletType ? ` (${walletType})` : ""}`
              : method}
          </p>
        </div>
      </div>
    </div>
  );
};
