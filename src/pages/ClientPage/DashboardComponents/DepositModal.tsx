import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDepositStore } from "@/Store/depositStore";
import {
  DepositModalHeader,
  MethodSelection,
  BankSelect,
  BankDetails,
  WalletSelect,
  WalletDetails,
  CardDetails,
} from "@/components/DepositModal";
import type { DepositModalProps } from "@/types/deposit.types";

const DepositModal: React.FC<DepositModalProps> = ({
  open,
  onClose,
  onProcessing = () => {},
  onSuccess = () => {},
  onError = () => {},
  onSubmitDeposit, // NEW: Function to submit deposit from parent
  isSubmitting = false, // NEW: Loading state from parent
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { step, resetState } = useDepositStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // The voice assistant's trigger/panel is a separate, always-on-top
      // fixed element - it's never "inside" this modal's own ref, so
      // without this check clicking it (or anything else the assistant
      // renders) read as an outside click and closed the modal instead of
      // opening the assistant.
      if (target.closest?.("[data-voice-ui-root]")) {
        return;
      }

      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  // Handle successful deposit - close modal and call parent's onSuccess
  const handleDepositSuccess = () => {
    onClose(); // Close the modal first
    onSuccess(); // Then call parent's onSuccess callback
  };

  if (!open) return null;

  const renderStep = () => {
    switch (step) {
      case "method":
        return <MethodSelection />;
      case "bankSelect":
        return <BankSelect />;
      case "bankDetails":
        return (
          <BankDetails
            onSuccess={handleDepositSuccess}
            onError={onError}
            onProcessing={onProcessing}
            onSubmitDeposit={onSubmitDeposit} // NEW: Pass down to BankDetails
            isSubmitting={isSubmitting} // NEW: Pass loading state
          />
        );
      case "walletSelect":
        return <WalletSelect />;
      case "walletDetails":
        return (
          <WalletDetails
            onSuccess={handleDepositSuccess}
            onError={onError}
            onProcessing={onProcessing}
            onSubmitDeposit={onSubmitDeposit} // NEW: Pass down to WalletDetails
            isSubmitting={isSubmitting} // NEW: Pass loading state
          />
        );
      case "card":
        return <CardDetails />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      data-voice-scope="deposit modal"
      className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center sm:p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
        ref={modalContentRef}
        data-voice-target="deposit modal"
      >
        <div className="flex-shrink-0">
          <DepositModalHeader onClose={onClose} />
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {renderStep()}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
      `}</style>
    </div>,
    document.body,
  );
};

export default DepositModal;
