import { useState } from "react";
import { X } from "lucide-react";
import { useUserAccounts } from "@/hooks/useRatingQueries";
import type { UserAccount } from "@/types/rating.types";

interface SetupCopyingModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterAccount: string;
  masterName: string;
  minInvestment: number;
  onSuccess: () => void;
  onSubmit: (data: {
    copierAccount: string;
    minInvestment: number;
  }) => Promise<void>;
}

export const SetupCopyingModal = ({
  isOpen,
  onClose,
  masterName,
  minInvestment,
  onSuccess,
  onSubmit,
}: SetupCopyingModalProps) => {
  const [copierAccount, setCopierAccount] = useState("");
  const [investment, setInvestment] = useState(minInvestment.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: userAccounts = [], isLoading: loadingAccounts } =
    useUserAccounts();

  if (!isOpen) return null;

  const accounts = Array.isArray(userAccounts) ? userAccounts : [];

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await onSubmit({ copierAccount, minInvestment: parseFloat(investment) });
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to setup copying";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-strong rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-4 sm:p-6 lg:p-8 mx-4 animate-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-heading">
            Setup Copy Trading
          </h3>
          <button
            onClick={onClose}
            className="text-subtle hover:text-body transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-purple-600 font-medium mb-2">
            Master Trader: {masterName}
          </p>
          <p className="text-body text-sm">
            Min. Investment: ${minInvestment}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-heading mb-2 font-medium">
              Select Your Account
            </label>
            {loadingAccounts ? (
              <div className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-subtle flex items-center justify-center">
                Loading accounts...
              </div>
            ) : accounts.length === 0 ? (
              <div className="w-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                No accounts found. Please create an account first.
              </div>
            ) : (
              <select
                value={copierAccount}
                onChange={(e) => setCopierAccount(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base bg-surface border border-border text-heading focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
              >
                <option value="">Select an account</option>
                {accounts.map((account: UserAccount) => (
                  <option key={account._id} value={account.mt5Account}>
                    {account.mt5Account} - {account.accountType}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-heading mb-2 font-medium">
              Investment Amount ($)
            </label>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              min={minInvestment}
              step="0.01"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-heading placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-surface-strong border border-border text-body hover:bg-surface-strong transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || accounts.length === 0}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-heading hover:shadow-lg transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
