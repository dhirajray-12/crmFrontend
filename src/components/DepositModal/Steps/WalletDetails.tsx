import { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Hash,
  Upload,
  Copy,
  Loader2,
} from "lucide-react";
import {
  useUserAccounts,
  useSubmitDeposit,
} from "../../../hooks/useDepositData";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useToastStore } from "@/Store/toast.store";
import { useDepositStore } from "@/Store/depositStore";
import { AccountDropdown } from "@/components/DepositModal/Shared/AccountDropdown";
import { QrCodeDisplay } from "@/components/DepositModal/Shared/QrCodeDisplay";
import { LoadingSpinner } from "@/components/DepositModal/Shared/LoadingSpinner";
import type { AccountTypeOption, DepositFormData } from "@/types/deposit.types";

interface WalletDetailsProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  onProcessing?: () => void;
  onSubmitDeposit?: (formData: FormData) => Promise<unknown>;
  isSubmitting?: boolean;
}

export const WalletDetails: React.FC<WalletDetailsProps> = ({
  onSuccess,
  onError,
  onProcessing,
  onSubmitDeposit,
  isSubmitting = false,
}) => {
  const { selectedWallet, selectedAccount, setSelectedAccount } =
    useDepositStore();
  const { data: userAccounts, isLoading: accountsLoading } = useUserAccounts();
  const submitDeposit = useSubmitDeposit();
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState({
    amount: "",
    transactionId: "",
    proof: null as File | null,
  });
  const [copied, setCopied] = useState(false);
  const submitGuard = useActionGuard({
    isBusy: isSubmitting || submitDeposit.isPending,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedWallet?.walletAddress || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      const depositData: DepositFormData = {
        accountId: accountData?._id || selectedAccount.value,
        amount: formData.amount,
        paymentMethodId: selectedWallet!._id,
        paymentType: "crypto",
        transactionId: formData.transactionId,
        proof: formData.proof,
      };

      try {
        onProcessing?.();
        if (onSubmitDeposit) {
          const depositFormData = new FormData();
          depositFormData.append("accountId", depositData.accountId);
          depositFormData.append("amount", depositData.amount);
          depositFormData.append("paymentMethodId", depositData.paymentMethodId);
          depositFormData.append("paymentType", depositData.paymentType);
          depositFormData.append("transactionId", depositData.transactionId);
          depositFormData.append("proofOfPayment", depositData.proof as File);
          await onSubmitDeposit(depositFormData);
        } else {
          await submitDeposit.mutateAsync(depositData);
        }
        onSuccess?.();
      } catch (err: any) {
        onError?.(
          err?.response?.data?.message || "Failed to submit deposit request",
        );
      }
    });
  };

  if (!selectedWallet) return null;

  return (
    <div className="space-y-4">
      {/* Wallet Details */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          Wallet Information
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <Wallet className="h-3.5 w-3.5" /> Payment Type
              </span>
              <span className="text-sm text-heading">
                E-Wallet (Cryptocurrency)
              </span>
            </div>

            <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Status
              </span>
              <span
                className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                  selectedWallet.active
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {selectedWallet.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
              <span className="mb-1 block text-xs font-semibold text-violet-700 dark:text-violet-300">
                Wallet Name
              </span>
              <span className="block text-sm font-medium text-heading">
                {selectedWallet.walletName}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
              <span className="mb-1 block text-xs font-semibold text-violet-700 dark:text-violet-300">
                Wallet Address
              </span>
              <div className="flex items-center gap-2">
                <span className="break-all font-mono text-[11px] text-heading">
                  {selectedWallet.walletAddress}
                </span>
                <button
                  onClick={copyToClipboard}
                  data-voice-target="copy wallet address"
                  className="relative flex-shrink-0 rounded-md border border-violet-400/20 bg-violet-500/10 p-1.5 transition-colors hover:bg-violet-500/20"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-3.5 w-3.5 text-violet-700 dark:text-violet-200" />
                  {copied && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface-strong px-2 py-1 text-[10px] text-heading">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <QrCodeDisplay
            qrCode={selectedWallet.qrCode}
            paymentLink={selectedWallet.paymentLink}
            title="Wallet QR Code"
            fallbackValue={selectedWallet.walletAddress || selectedWallet.walletName || ""}
          />
        </div>
      </div>

      {/* Deposit Form */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.1em] text-subtle">
          Submit Deposit Details
        </h3>

        <div className="mx-auto max-w-xl space-y-4">
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
              data-voice-target="deposit amount"
              data-voice-field="deposit amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Enter amount to deposit"
              className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-2.5 text-sm text-heading placeholder:text-subtle"
              disabled={isSubmitting || submitDeposit.isPending}
            />
            <p className="mt-1 text-xs text-subtle">
              Minimum deposit amount is $10
            </p>
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
              disabled={isSubmitting || submitDeposit.isPending}
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
              disabled={isSubmitting || submitDeposit.isPending}
            />
            <p className="mt-1 text-xs text-subtle">
              Supported: PDF, JPG, JPEG, PNG
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              accountsLoading ||
              !selectedAccount ||
              isSubmitting ||
              submitDeposit.isPending
            }
            data-voice-target="submit deposit request"
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || submitDeposit.isPending ? (
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
