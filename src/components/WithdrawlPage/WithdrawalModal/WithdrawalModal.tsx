import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle, Shield, ChevronLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Account,
  SavedBankDetails,
  SavedWallets,
  OTPState,
} from "@/types/WithdrawalPage.types";
import { AccountSelector } from "./AccountSelector";
import { AmountInput } from "./AmountInput";
import { MethodSelector } from "./MethodSelector";
import { BankDetailsForm } from "./BankDetailsForm";
import { EWalletForm } from "./EWalletForm";
import { SelectedDetailsSummary } from "./SelectedDetailsSummary";
import { OTPVerification } from "./OTPVerification";
import { CardRefundInfo, useCardRefundable } from "@/components/WithdrawalForm/methods/CardRefundInfo";

const CARD_METHOD = "Card (Stripe)";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  savedWallets: SavedWallets | null;
  savedBankDetails: SavedBankDetails | null;
  selectedAccount: Account | null;
  formData: any;
  selectedMethod: string;
  selectedWalletType: string;
  showEWalletOptions: boolean;
  otpState: OTPState;
  isProcessing: boolean;
  onAccountSelect: (account: Account) => void;
  onAmountChange: (value: string) => void;
  onMethodSelect: (method: string) => void;
  onInputChange: (field: string, value: string) => void;
  onWalletTypeSelect: (type: string) => void;
  onWalletAddressChange: (value: string) => void;
  onToggleEWalletOptions: () => void;
  onClearBankDetails: () => void;
  onClearWalletDetails: () => void;
  onWalletSelect: (wallet: any) => void;
  onSendOTP: () => void;
  onVerifyOTP: () => void;
  onResendOTP: () => void;
  onOtpChange: (otp: string) => void;
  onSubmit: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

const STEPS = [
  { label: "Account & Amount" },
  { label: "Method" },
  { label: "Payout Details" },
  { label: "Verify & Submit" },
];

export const WithdrawalModal = ({
  isOpen,
  onClose,
  accounts,
  savedWallets,
  savedBankDetails,
  selectedAccount,
  formData,
  selectedMethod,
  selectedWalletType,
  showEWalletOptions,
  otpState,
  isProcessing,
  onAccountSelect,
  onAmountChange,
  onMethodSelect,
  onInputChange,
  onWalletTypeSelect,
  onWalletAddressChange,
  onToggleEWalletOptions,
  onClearBankDetails,
  onClearWalletDetails,
  onWalletSelect,
  onSendOTP,
  onVerifyOTP,
  onResendOTP,
  onOtpChange,
  onSubmit,
  modalRef,
}: WithdrawalModalProps) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const isCard = selectedMethod === CARD_METHOD;
  const { data: cardMax } = useCardRefundable(isOpen && isCard);

  if (!isOpen) return null;

  const isStep1Valid =
    !!selectedAccount && !!formData.amount && parseFloat(formData.amount) >= 1;
  const isStep2Valid = !!selectedMethod;
  const isStep3Valid =
    selectedMethod === "Bank Transfer"
      ? !!formData.bankName &&
        !!formData.accountHolderName &&
        !!formData.accountNumber &&
        !!formData.ifscCode
      : selectedMethod === "E-Wallet"
        ? !!selectedWalletType && !!formData.walletAddress
        : isCard
          ? parseFloat(formData.amount) <= (cardMax ?? 0)
          : false;

  const canGoNext =
    step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : isStep3Valid;

  const goNext = () => setStep((prev) => Math.min(prev + 1, STEPS.length));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return createPortal(
    <div
      data-voice-scope="withdrawal modal"
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-2 backdrop-blur-3xl sm:p-4"
      style={{ overflowY: "auto" }}
    >
      <div
        ref={modalRef}
        className="animate-scale-in my-4 mx-2 w-full max-w-3xl rounded-2xl border border-border bg-background p-4 shadow-2xl sm:my-8 sm:mx-4 sm:rounded-3xl sm:p-8"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex min-w-0 items-center gap-2">
            {step > 1 && (
              <button
                onClick={goBack}
                data-voice-target="withdrawal back"
                className="flex-shrink-0 rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="truncate bg-gradient-to-r from-white via-rose-100 to-slate-300 bg-clip-text text-xl font-bold text-transparent sm:text-3xl">
              Withdraw Funds
            </h2>
          </div>
          <button
            onClick={onClose}
            data-voice-target="close withdrawal modal"
            className="flex-shrink-0 rounded-lg p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading sm:rounded-xl sm:p-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2 sm:mb-8">
          {STEPS.map((s, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < step;
            const isCurrent = stepNumber === step;
            return (
              <div key={s.label} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
                      isCompleted
                        ? "border-rose-400/40 bg-rose-500/[0.24] text-rose-100"
                        : isCurrent
                          ? "border-rose-400/50 bg-rose-500/[0.16] text-heading"
                          : "border-border bg-surface-strong/[0.04] text-subtle"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNumber}
                  </div>
                  <span
                    className={`hidden text-xs font-semibold uppercase tracking-[0.1em] sm:inline ${
                      isCurrent ? "text-heading" : "text-subtle"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {stepNumber < STEPS.length && (
                  <div
                    className={`h-px flex-1 ${
                      isCompleted ? "bg-rose-400/40" : "bg-surface-strong/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {step === 1 && (
              <>
                <AccountSelector
                  accounts={accounts}
                  selectedAccount={selectedAccount}
                  onSelect={onAccountSelect}
                />
                <AmountInput value={formData.amount} onChange={onAmountChange} />
              </>
            )}

            {step === 2 && (
              <MethodSelector
                selectedMethod={selectedMethod}
                onSelect={onMethodSelect}
              />
            )}

            {step === 3 && (
              <>
                <SelectedDetailsSummary
                  selectedAccount={selectedAccount}
                  amount={formData.amount}
                  method={selectedMethod}
                  walletType={selectedWalletType}
                />

                {selectedMethod === "Bank Transfer" && (
                  <BankDetailsForm
                    formData={formData}
                    savedBankDetails={savedBankDetails}
                    onChange={onInputChange}
                    onClearSavedDetails={onClearBankDetails}
                  />
                )}

                {selectedMethod === "E-Wallet" && (
                  <EWalletForm
                    savedWallets={savedWallets || { usdt: "", eth: "", tron: "" }}
                    selectedWalletType={selectedWalletType}
                    walletAddress={formData.walletAddress}
                    showOptions={showEWalletOptions}
                    onWalletTypeSelect={onWalletTypeSelect}
                    onWalletAddressChange={onWalletAddressChange}
                    onToggleOptions={onToggleEWalletOptions}
                    onClearSavedDetails={onClearWalletDetails}
                    onWalletSelect={onWalletSelect}
                  />
                )}

                {isCard && <CardRefundInfo amount={formData.amount} />}
              </>
            )}

            {step === 4 && (
              <>
                <SelectedDetailsSummary
                  selectedAccount={selectedAccount}
                  amount={formData.amount}
                  method={selectedMethod}
                  walletType={selectedWalletType}
                />

                <OTPVerification
                  otpState={otpState}
                  onSendOTP={onSendOTP}
                  onVerifyOTP={onVerifyOTP}
                  onResendOTP={onResendOTP}
                  onOtpChange={onOtpChange}
                />

                <button
                  onClick={onSubmit}
                  disabled={isProcessing || !otpState.isOTPVerified}
                  data-voice-target="submit withdrawal request"
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/[0.16] px-6 py-4 text-lg font-bold text-rose-100 transition-all duration-300 shadow-lg hover:bg-rose-500/[0.24] hover:scale-[1.01] ${
                    isProcessing || !otpState.isOTPVerified
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : !otpState.isOTPVerified ? (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify OTP to Submit
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Withdrawal Request
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 sm:mt-8">
            {step > 1 ? (
              <button
                onClick={goBack}
                data-voice-target="withdrawal step back"
                className="rounded-xl border border-border bg-surface-strong/[0.04] px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08]"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={goNext}
              disabled={!canGoNext}
              data-voice-target="withdrawal step next"
              className={`rounded-xl border border-rose-400/30 bg-rose-500/[0.16] px-6 py-2.5 text-sm font-bold text-rose-100 transition-all duration-300 hover:bg-rose-500/[0.24] ${
                !canGoNext ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
