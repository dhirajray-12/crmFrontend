import type { Account } from "@/types/withdrawal.types";

interface SelectedDetailsSummaryProps {
  selectedAccount: Account;
  amount: string;
  method: string;
  walletType?: string;
}

export const SelectedDetailsSummary: React.FC<SelectedDetailsSummaryProps> = ({
  selectedAccount,
  amount,
  method,
  walletType,
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-100">
      <h4 className="text-lg font-bold text-orange-800 mb-3">
        Selected Details
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-orange-600 font-medium text-sm">Account Number</p>
          <p className="font-mono text-lg font-bold text-subtle">
            {selectedAccount.accountNumber}
          </p>
        </div>
        <div>
          <p className="text-orange-600 font-medium text-sm">Account Type</p>
          <p className="text-lg font-bold text-subtle">
            {selectedAccount.accountType}
          </p>
        </div>
        <div>
          <p className="text-orange-600 font-medium text-sm">
            Withdrawal Amount
          </p>
          <p className="text-2xl font-bold text-green-600">${amount || "0"}</p>
        </div>
        <div>
          <p className="text-orange-600 font-medium text-sm">Method</p>
          <p className="text-lg font-bold text-subtle">
            {method === "E-Wallet"
              ? `E-Wallet${walletType ? ` (${walletType})` : ""}`
              : method}
          </p>
        </div>
      </div>
    </div>
  );
};
