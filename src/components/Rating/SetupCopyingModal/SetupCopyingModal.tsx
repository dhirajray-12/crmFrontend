import { apiService } from "@/services/rating.service";
import type { UserAccount } from "@/types/rating.types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface SetupCopyingModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterAccount: string;
  masterName: string;
  minInvestment: number;
  onSuccess: () => void;
}

export const SetupCopyingModal = ({
  isOpen,
  onClose,
  masterAccount,
  masterName,
  minInvestment,
  onSuccess,
}: SetupCopyingModalProps) => {
  const [copierAccount, setCopierAccount] = useState("");
  const [investment, setInvestment] = useState(minInvestment.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserAccounts();
    }
  }, [isOpen]);

  const fetchUserAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await apiService.getUserAccounts();
      setUserAccounts(response.data || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError("Failed to load your accounts");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiService.setupCopying({
        masterAccount,
        copierAccount,
        minInvestment: parseFloat(investment),
      });
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

  if (!isOpen) return null;

  return (
    <div
      data-voice-scope="setup copying modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong p-4"
    >
      <div className="flex max-h-[min(90vh,700px)] w-full max-w-[26rem] flex-col overflow-hidden rounded-xl border border-border bg-surface-strong shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-heading">Setup Copy Trading</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div>
              <p className="mb-1 text-sm font-medium text-heading">
                Master Trader: {masterName}
              </p>
              <p className="text-xs text-subtle">
                Min. Investment: ${minInvestment}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-border bg-surface-strong/[0.03] p-3.5">
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
              <p className="pl-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                Copy Session Summary
              </p>
              <p className="mt-1.5 pl-2 text-sm leading-5 text-heading">
                You are about to mirror <span className="font-semibold text-heading">{masterName}</span>. Once confirmed,
                new trades from this master will be copied to your selected account using your investment size.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading">
                Select Your Account
              </label>
              {loadingAccounts ? (
                <div className="flex w-full items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-3 text-sm text-subtle">
                  Loading accounts...
                </div>
              ) : userAccounts.length === 0 ? (
                <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  No available accounts found. Accounts already linked to copy trading are hidden here.
                </div>
              ) : (
                  <select
                    data-voice-field="account"
                    value={copierAccount}
                  onChange={(e) => setCopierAccount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-3 text-sm text-heading transition-colors focus:border-accent/40 focus:outline-none"
                  required
                >
                  <option value="" className="bg-gray-900">
                    Select an account
                  </option>
                  {userAccounts.map((account) => (
                    <option
                      key={account._id}
                      value={account.mt5Account}
                      className="bg-gray-900"
                    >
                      {account.mt5Account} - {account.accountType} - Balance: $
                      {(account.balance || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
            )}
          </div>

          <div>
              <label className="mb-1.5 block text-sm font-medium text-heading">
                Investment Amount ($)
              </label>
              <input
                type="number"
                data-voice-field="investment amount"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                min={minInvestment}
                step="0.01"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-3 text-sm text-heading placeholder-slate-500 transition-colors focus:border-accent/40 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-surface px-5 py-3.5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                data-voice-target="cancel copy setup"
                className="flex-1 rounded-lg border border-border bg-surface-strong/[0.04] px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || userAccounts.length === 0}
                data-voice-target="confirm copy setup"
                className="flex-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Setting up..." : "Confirm"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
