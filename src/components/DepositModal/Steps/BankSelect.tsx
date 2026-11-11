import { Building2, CheckCircle2 } from "lucide-react";
import { usePaymentMethods } from "../../../hooks/useDepositData";
import { useDepositStore } from "@/Store/depositStore";
import { ErrorMessage } from "@/components/DepositModal/Shared/ErrorMessage";
import { LoadingSpinner } from "@/components/DepositModal/Shared/LoadingSpinner";
import { EmptyState } from "@/components/DepositModal/Shared/EmptyState";
import type { PaymentMethod } from "@/types/deposit.types";

export const BankSelect: React.FC = () => {
  const { data, isLoading, error, refetch } = usePaymentMethods();
  const { setSelectedBank, setStep } = useDepositStore();

  if (isLoading) return <LoadingSpinner message="Loading payment methods..." />;
  if (error)
    return (
      <ErrorMessage
        message="Failed to fetch payment methods"
        onRetry={refetch}
      />
    );

  const bankAccounts = data?.["Bank Account"] || [];

  if (bankAccounts.length === 0) {
    return (
      <EmptyState
        title="No active bank accounts available"
        message="Please contact support to add payment methods"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {bankAccounts.map((bank: PaymentMethod) => (
        <button
          key={bank._id}
          onClick={() => {
            setSelectedBank(bank);
            setStep("bankDetails");
          }}
          data-voice-target={`bank ${bank.bankName}`}
          data-voice-value={`bank ${bank.bankName}`}
          className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-strong/[0.04]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-accent/10">
                <Building2 className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-heading">
                  {bank.bankName}
                </h3>
                <p className="text-xs text-subtle">Bank Account</p>
              </div>
            </div>
            {bank.active && (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-700 dark:text-emerald-400" />
            )}
          </div>

          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                Account Holder
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-heading">
                {bank.accountHolderName}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                Account Number
              </p>
              <p className="mt-0.5 font-mono text-xs text-heading">
                ****{bank.accountNumber?.slice(-4)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
                IFSC Code
              </p>
              <p className="mt-0.5 font-mono text-xs text-heading">
                {bank.ifsc_swift}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <span
              className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                bank.active
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {bank.active ? "Active" : "Inactive"}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
