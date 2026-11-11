// src/components/DepositModal/Steps/CardDetails.tsx
// Card deposit: the backend creates a Pending deposit and a Stripe Checkout
// page; the client pays there and comes back to /client/deposit. The deposit
// is credited automatically when Stripe confirms the payment (through Relaya).
import { useState } from "react";
import { CreditCard, DollarSign, Loader2, Lock } from "lucide-react";
import api from "@/API/axiosInstance";
import { useUserAccounts } from "@/hooks/useDepositData";
import { useDepositStore } from "@/Store/depositStore";
import { useToastStore } from "@/Store/toast.store";
import { AccountDropdown } from "@/components/DepositModal/Shared/AccountDropdown";
import { LoadingSpinner } from "@/components/DepositModal/Shared/LoadingSpinner";
import type { AccountTypeOption } from "@/types/deposit.types";

const MIN_AMOUNT = 10;

export const CardDetails: React.FC = () => {
  const { selectedAccount, setSelectedAccount, setStep } = useDepositStore();
  const { data: userAccounts, isLoading: accountsLoading } = useUserAccounts();
  const addToast = useToastStore((state) => state.addToast);
  const [amount, setAmount] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const accountOptions: AccountTypeOption[] = (userAccounts || []).map((acc) => ({
    label: `${acc.mt5Account} (${acc.accountType || acc.name})`,
    value: acc.mt5Account,
    id: acc._id,
  }));
  const value = parseFloat(amount);
  const amountError = amount && (!Number.isFinite(value) || value < MIN_AMOUNT) ? `Minimum deposit amount is $${MIN_AMOUNT}` : "";

  const handlePay = async () => {
    if (!selectedAccount) {
      addToast("error", "Please select an account");
      return;
    }
    if (!Number.isFinite(value) || value < MIN_AMOUNT) {
      addToast("error", `Minimum deposit amount is $${MIN_AMOUNT}`);
      return;
    }
    const account = userAccounts?.find((acc) => acc.mt5Account === selectedAccount.value);
    setRedirecting(true);
    try {
      const res = await api.post("/clientdeposits/stripe/checkout", {
        accountId: account?._id || selectedAccount.id,
        amount: value,
        returnPath: "/client/deposit",
      });
      const url = res.data?.data?.checkoutUrl;
      if (!url) throw new Error("No checkout page was returned");
      window.location.assign(url); // Stripe's secure payment page
    } catch (err: any) {
      setRedirecting(false);
      addToast("error", err?.response?.data?.message || err?.message || "Could not start the card payment");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          How card deposits work
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-subtle">
          <li>Choose the trading account and the amount.</li>
          <li>You're taken to Stripe's secure page to pay by card.</li>
          <li>As soon as the payment succeeds, the amount is added to your trading account automatically. No proof of payment is needed.</li>
        </ol>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-subtle">
          <Lock className="h-3.5 w-3.5" /> Card details are handled by Stripe and never reach our servers.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          Pay by card
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <CreditCard className="h-3.5 w-3.5 text-accent" /> Select Account
            </label>
            {accountsLoading ? (
              <LoadingSpinner message="Loading accounts..." />
            ) : accountOptions.length === 0 ? (
              <div className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-2.5 text-sm text-subtle">
                No accounts found. Please create an account first.
              </div>
            ) : (
              <AccountDropdown
                options={accountOptions}
                selected={selectedAccount}
                onSelect={setSelectedAccount}
                placeholder="Select trading account"
                disabled={redirecting}
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <DollarSign className="h-3.5 w-3.5 text-accent" /> Amount (USD)
            </label>
            <input
              type="number"
              min={MIN_AMOUNT}
              step="0.01"
              data-voice-target="deposit amount"
              data-voice-field="deposit amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum $${MIN_AMOUNT}`}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-heading placeholder:text-subtle ${
                amountError ? "border-rose-500/50 bg-rose-500/5" : "border-border bg-surface-strong/[0.03]"
              }`}
              disabled={redirecting}
            />
            {amountError && <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-300">{amountError}</p>}
          </div>

          <button
            onClick={handlePay}
            disabled={accountsLoading || !selectedAccount || !amount || !!amountError || redirecting}
            data-voice-target="pay by card"
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {redirecting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Opening secure payment…
              </span>
            ) : (
              `Pay ${Number.isFinite(value) && value >= MIN_AMOUNT ? `$${value.toFixed(2)} ` : ""}by card`
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep("method")}
            disabled={redirecting}
            className="w-full text-center text-xs font-medium text-subtle hover:text-heading"
          >
            Choose another method
          </button>
        </div>
      </div>
    </div>
  );
};
