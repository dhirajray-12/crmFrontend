import { useWithdrawalStore } from "@/Store/withdrawalStore";
import { AccountsList } from "@/components/WithdrawalForm/Accounts/AccountsList";
import { SelectedDetailsSummary } from "@/components/WithdrawalForm/Accounts/SelectedDetailsSummary";
import { BankTransferForm } from "@/components/WithdrawalForm/Bank/BankTransferForm";
import { InputField } from "@/components/WithdrawalForm/Shared/InputField";
import { MethodSelection } from "@/components/WithdrawalForm/methods/MethodSelection";
import { useWalletOptions } from "@/components/WithdrawalForm/wallet/WalletOptions";
import { WalletSelection } from "@/components/WithdrawalForm/wallet/WalletSelection";
import { CardRefundInfo } from "@/components/WithdrawalForm/methods/CardRefundInfo";
import type { Account, SavedWallets } from "@/types/withdrawal.types";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface WithdrawalFormContentProps {
  availableBalances: Account[];
  savedWallets?: SavedWallets | null;
  isProcessing: boolean;
  onSubmit: () => void;
}

export const WithdrawalFormContent: React.FC<WithdrawalFormContentProps> = ({
  availableBalances,
  savedWallets,
  isProcessing,
  onSubmit,
}) => {
  const {
    selectedAccount,
    selectedMethod,
    selectedWalletType,
    showEWalletOptions,
    formData,
    setSelectedAccount,
    setSelectedMethod,
    setSelectedWalletType,
    setShowEWalletOptions,
    updateFormData,
  } = useWithdrawalStore();

  const walletOptions = useWalletOptions(savedWallets);

  const handleWalletTypeSelection = (wallet: any) => {
    setSelectedWalletType(wallet.name);
    updateFormData({ walletType: wallet.name });
    setShowEWalletOptions(false);

    if (wallet.address) {
      updateFormData({ walletAddress: wallet.address });
    }
  };

  const handleWalletInput = (value: string) => {
    updateFormData({ walletAddress: value });

    if (!savedWallets) return;

    if (value === savedWallets.usdt) {
      setSelectedWalletType("USDT");
      updateFormData({ walletType: "USDT" });
    } else if (value === savedWallets.eth) {
      setSelectedWalletType("ETH");
      updateFormData({ walletType: "ETH" });
    } else if (value === savedWallets.tron) {
      setSelectedWalletType("TRON");
      updateFormData({ walletType: "TRON" });
    }
  };

  return (
    <div className="space-y-6">
      <AccountsList
        accounts={availableBalances}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
      />

      <div>
        <InputField
          label="Withdrawal Amount ($)"
          type="number"
          min="1"
          value={formData.amount}
          onChange={(e) => updateFormData({ amount: e.target.value })}
          placeholder="Enter amount to withdraw"
        />
        <p className="mt-2 text-sm text-subtle">Minimum withdrawal: $1.00</p>
      </div>

      <MethodSelection
        selectedMethod={selectedMethod}
        onSelectMethod={(method) => {
          setSelectedMethod(method);
          if (method !== "E-Wallet") {
            setShowEWalletOptions(false);
            setSelectedWalletType("");
          }
        }}
      />

      <AnimatePresence>
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {selectedAccount && (
              <SelectedDetailsSummary
                selectedAccount={selectedAccount}
                amount={formData.amount}
                method={selectedMethod}
                walletType={selectedWalletType}
              />
            )}

            {selectedMethod === "Bank Transfer" && (
              <BankTransferForm
                formData={formData}
                onUpdateForm={updateFormData}
              />
            )}

            {selectedMethod === "Card (Stripe)" && <CardRefundInfo amount={formData.amount} />}

            {selectedMethod === "E-Wallet" && (
              <WalletSelection
                wallets={walletOptions}
                selectedWalletType={selectedWalletType}
                showOptions={showEWalletOptions}
                walletAddress={formData.walletAddress || ""}
                onToggleOptions={() =>
                  setShowEWalletOptions(!showEWalletOptions)
                }
                onSelectWallet={handleWalletTypeSelection}
                onWalletAddressChange={handleWalletInput}
              />
            )}

            <button
              onClick={onSubmit}
              disabled={isProcessing}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.16] px-6 py-4 text-lg font-semibold text-accent shadow-[0_16px_40px_rgba(2,132,199,0.18)] transition-all duration-300 hover:bg-accent/[0.24] ${
                isProcessing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Withdrawal Request"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
