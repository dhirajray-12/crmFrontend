import { useEffect, useRef } from "react";
import { useWithdrawalStore } from "@/Store/withdrawalStore";
import { useSubmitWithdrawal } from "@/hooks/useWithdrawalData";
import { ModalHeader } from "@/components/WithdrawalForm/Shared/ModalHeader";
import { useToastStore } from "@/Store/toast.store";
import { WithdrawalFormContent } from "@/components/WithdrawalForm/WithdrawalFormContent";
import type { WithdrawalFormProps } from "@/types/withdrawal.types";

export default function WithdrawalForm({
  isOpen,
  onClose,
  availableBalances,
  onSuccess,
  savedWallets,
}: WithdrawalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore((state) => state.addToast);

  const {
    resetState,
    selectedAccount,
    selectedMethod,
    selectedWalletType,
    formData,
  } = useWithdrawalStore();
  const submitWithdrawal = useSubmitWithdrawal();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // See DepositModal.tsx - the voice assistant is a separate,
      // always-on-top fixed element, so without this it read as an
      // outside click and closed this modal instead of opening the
      // assistant.
      if (target.closest?.("[data-voice-ui-root]")) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    if (!formData.account || !formData.amount || !selectedMethod) {
      addToast("error", "Fill all fields and select method");
      return false;
    }
    return true;
  };

  const prepareRequestBody = () => {
    const body: any = {
      accountId: selectedAccount?._id,
      accountNumber: selectedAccount?.accountNumber,
      accountType: selectedAccount?.accountType,
      amount: Number(formData.amount),
      paymentMethod:
        selectedMethod === "Bank Transfer"
          ? "bank"
          : selectedMethod === "Card (Stripe)"
            ? "stripe_card" // refunded to the card the client deposited with
            : selectedWalletType.toLowerCase(),
      otpVerified: true,
    };

    if (selectedMethod === "Bank Transfer") {
      body.bankDetails = {
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      };
    } else if (selectedMethod === "E-Wallet") {
      body.eWalletDetails = {
        type: selectedWalletType.toLowerCase(),
        walletId: formData.walletAddress,
      };
    }

    return body;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      addToast("info", "Processing your withdrawal request...");

      const body = prepareRequestBody();
      await submitWithdrawal.mutateAsync(body);

      addToast("success", "Withdrawal request submitted successfully!");

      setTimeout(() => {
        onClose();
        resetState();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit withdrawal.";
      addToast("error", msg);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong p-4 backdrop-blur-xl"
        style={{ overflowY: "auto" }}
      >
        <div
          ref={modalRef}
          className="client-theme-surface-strong my-8 w-full max-w-4xl rounded-[2rem] border border-border p-6 shadow-[0_24px_60px_rgba(2,6,23,0.55)] animate-scale-in sm:p-8"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <ModalHeader title="Withdraw Funds" onClose={onClose} />

          <WithdrawalFormContent
            availableBalances={availableBalances}
            savedWallets={savedWallets}
            isProcessing={submitWithdrawal.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.35);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </>
  );
}
