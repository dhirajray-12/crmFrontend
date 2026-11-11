// src/components/DepositModal/Steps/BankDetails.tsx
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Hash,
  Upload,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useUserAccounts } from "@/hooks/useDepositData";
import { useDepositStore } from "@/Store/depositStore";
import { useToastStore } from "@/Store/toast.store";
import { AccountDropdown } from "@/components/DepositModal/Shared/AccountDropdown";
import { QrCodeDisplay } from "@/components/DepositModal/Shared/QrCodeDisplay";
import { LoadingSpinner } from "@/components/DepositModal/Shared/LoadingSpinner";
import type { AccountTypeOption } from "@/types/deposit.types";

interface BankDetailsProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  onProcessing?: () => void;
  onSubmitDeposit?: (formData: FormData) => Promise<unknown>;
  isSubmitting?: boolean;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
  onSuccess,
  onError,
  onProcessing,
  onSubmitDeposit,
  isSubmitting = false,
}) => {
  const { selectedBank, selectedAccount, setSelectedAccount } =
    useDepositStore();
  const { data: userAccounts, isLoading: accountsLoading } = useUserAccounts();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    transactionId: "",
    proof: null as File | null,
  });
  const [amountError, setAmountError] = useState("");
  const addToast = useToastStore((state) => state.addToast);
  const submitGuard = useActionGuard({
    isBusy: isSubmitting,
    warningMessage:
      "Deposit submission is already being processed. Please wait for the current request to finish.",
  });

  const accountOptions: AccountTypeOption[] = (userAccounts || []).map(
    (acc) => ({
      label: `${acc.mt5Account} (${acc.accountType || acc.name})`,
      value: acc.mt5Account,
      id: acc._id,
    }),
  );

  const handleSubmit = async () => {
    await submitGuard.run(async () => {
      if (!selectedAccount) {
        addToast("error", "Please select an account");
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) < 10) {
        addToast("error", "Minimum deposit amount is $10");
        return;
      }
      if (!formData.transactionId.trim()) {
        addToast("error", "Please enter a transaction ID");
        return;
      }
      if (!formData.proof) {
        addToast("error", "Please upload proof of payment");
        return;
      }

      const accountData = userAccounts?.find(
        (acc) => acc.mt5Account === selectedAccount.value,
      );

      const depositFormData = new FormData();
      depositFormData.append(
        "accountId",
        accountData?._id || selectedAccount.value,
      );
      depositFormData.append("amount", formData.amount);
      depositFormData.append("paymentMethodId", selectedBank!._id);
      depositFormData.append("paymentType", "bank");
      depositFormData.append("transactionId", formData.transactionId);
      depositFormData.append("proofOfPayment", formData.proof);

      try {
        onProcessing?.();

        if (onSubmitDeposit) {
          await onSubmitDeposit(depositFormData);
          onSuccess?.();
        } else {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/clientdeposits`,
            {
              method: "POST",
              body: depositFormData,
              credentials: "include",
            },
          );
          const data = await response.json();

          if (data.success) {
            addToast("success", "Deposit request submitted successfully!");
            setFormData({ amount: "", transactionId: "", proof: null });
            onSuccess?.();
            setTimeout(() => {
              navigate("/client/deposit");
            }, 300);
          } else {
            throw new Error(data.message || "Failed to submit deposit");
          }
        }
      } catch (err: any) {
        addToast("error", err?.message || "Failed to submit deposit request");
        onError?.(err?.message || "Failed to submit deposit request");
      }
    });
  };

  if (!selectedBank) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left: Bank Account Details */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          Deposit Account Details
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-subtle">
              <Building2 className="h-3.5 w-3.5" /> Payment Type
            </span>
            <span className="font-medium text-heading">Bank Transfer</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-subtle">
              <CheckCircle2 className="h-3.5 w-3.5" /> Status
            </span>
            <span
              className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                selectedBank.active
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {selectedBank.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="text-subtle">Account Holder</span>
            <span className="font-medium text-heading">
              {selectedBank.accountHolderName}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="text-subtle">Account Number</span>
            <span className="font-mono text-heading">
              {selectedBank.accountNumber}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="text-subtle">IFSC Code</span>
            <span className="font-mono text-heading">
              {selectedBank.ifsc_swift}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <span className="text-subtle">Bank Name</span>
            <span className="font-medium text-heading">
              {selectedBank.bankName}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <QrCodeDisplay
            qrCode={selectedBank.qrCode}
            paymentLink={selectedBank.paymentLink}
            fallbackValue={`BANK:${selectedBank.bankName || ""}|HOLDER:${selectedBank.accountHolderName || ""}|ACCOUNT:${selectedBank.accountNumber || ""}|IFSC:${selectedBank.ifsc_swift || ""}`}
          />
        </div>
      </div>

      {/* Right: Deposit Form */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          Submit Deposit Details
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
                placeholder="Choose your account"
                voiceField="deposit account"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <DollarSign className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" /> Deposit
              Amount ($)
            </label>
            <input
              type="number"
              min="10"
              data-voice-target="deposit amount"
              data-voice-field="deposit amount"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, amount: value });

                if (!value) {
                  setAmountError("Deposit amount is required");
                } else if (parseFloat(value) < 10) {
                  setAmountError("Minimum deposit amount is $10");
                } else {
                  setAmountError("");
                }
              }}
              placeholder="Minimum $10"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-heading placeholder:text-subtle ${
                amountError
                  ? "border-rose-400/40 bg-rose-400/[0.05]"
                  : "border-border bg-surface-strong/[0.03]"
              }`}
              disabled={isSubmitting}
            />
            {amountError && (
              <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                {amountError}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <Hash className="h-3.5 w-3.5 text-accent" /> Transaction ID{" "}
              <span className="text-rose-700 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              data-voice-target="transaction id"
              data-voice-field="transaction id"
              value={formData.transactionId}
              onChange={(e) =>
                setFormData({ ...formData, transactionId: e.target.value })
              }
              placeholder="Enter your transaction ID"
              className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-2.5 text-sm text-heading placeholder:text-subtle"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <Upload className="h-3.5 w-3.5 text-violet-700 dark:text-violet-300" /> Upload Payment
              Proof
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              data-voice-target="payment proof"
              data-voice-field="payment proof"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proof: e.target.files?.[0] || null,
                })
              }
              className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-2.5 text-xs text-subtle file:mr-3 file:rounded-md file:border-0 file:bg-accent/20 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-accent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-subtle">
              Supported: PDF, JPG, JPEG, PNG
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={accountsLoading || !selectedAccount || isSubmitting}
            data-voice-target="submit deposit request"
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              "Submit Deposit Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
