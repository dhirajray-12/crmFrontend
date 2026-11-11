import { useWithdrawalStore } from "@/Store/Ibwithdrawal.store";
import { useSubmitWithdrawalMutation } from "@/hooks/useIBWithdrawalQueries";
import { motion } from "framer-motion";
import { ArrowDownCircle, Loader2 } from "lucide-react";
import { AmountInput } from "./AmountInput";
import { BankDetailsForm } from "./BankDetailsForm";
import { CryptoWalletForm } from "./CryptoWalletForm";
import { WithdrawalMethodSelector } from "./WithdrawalMethodSelector";

export const WithdrawalForm = () => {
  const { formData, submitting, getAvailableBalance, setFormData } =
    useWithdrawalStore();
  const submitMutation = useSubmitWithdrawalMutation();

  const handleSubmit = async () => {
    await submitMutation.mutateAsync(formData);
  };

  const handleMethodChange = (method: "bank" | "wallet") => {
    setFormData({ withdrawalMethod: method });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-2.5">
          <ArrowDownCircle className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-heading sm:text-xl">Request Withdrawal</h2>
          <p className="text-sm text-subtle">Submit a payout from your commission balance</p>
        </div>
      </div>

      <div className="space-y-4">
        <AmountInput
          value={formData.withdrawalAmount}
          onChange={(value) => setFormData({ withdrawalAmount: value })}
          maxAmount={getAvailableBalance()}
        />

        <WithdrawalMethodSelector
          selectedMethod={formData.withdrawalMethod}
          onChange={handleMethodChange}
        />

        {/* Bank Transfer Fields */}
        {formData.withdrawalMethod === "bank" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BankDetailsForm />
          </motion.div>
        )}

        {/* Crypto Wallet Fields */}
        {formData.withdrawalMethod === "wallet" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CryptoWalletForm />
          </motion.div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          data-voice-target="submit withdrawal request"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/15 px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Withdrawal Request"
          )}
        </button>
      </div>
    </div>
  );
};
