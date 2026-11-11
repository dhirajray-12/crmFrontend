import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@/Store/toast.store"; // NEW
import { useCreateAccountStore } from "@/Store/createAccountStore";
import { ModalHeader } from "@/components/CreateAccountModal/Shared/ModalHeader";
import { AlertMessage } from "@/components/CreateAccountModal/Shared/AlertMessage";
import { Step1_AccountTypeSelection } from "@/components/CreateAccountModal/Steps/Step1_AccountTypeSelection";
import { Step2_AccountConfiguration } from "@/components/CreateAccountModal/Steps/Step2_AccountConfiguration";
import { modalVariants, overlayVariants } from "@/Constants/animations";
import type { CreateAccountModalProps } from "@/types/createAccount.types";

export default function CreateAccountModalprops({
  open,
  onClose,
  onAccountCreated,
}: CreateAccountModalProps) {
  const { step, setStep, resetState } = useCreateAccountStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { addToast } = useToastStore(); // NEW
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      resetState();
      setError("");
      setSuccess("");
    }
  }, [open, resetState]);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSuccess = () => {
    addToast("success", "Account created successfully!"); // NEW
    setSuccess("Account created successfully!");
    setTimeout(() => {
      onAccountCreated?.();
      onClose();
      navigate("/client/account-list");
    }, 1500);
  };

  const handleError = (message: string) => {
    addToast("error", message);
    setError(message);
  };

  const getHeaderTitle = () => {
    return step === 1
      ? "Open New Trading Account"
      : "Account Configuration";
  };

  const getHeaderSubtitle = () => {
    return step === 1
      ? "Choose your perfect trading account"
      : "Configure your account settings";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2 sm:p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative mx-2 my-4 w-full max-w-4xl sm:mx-4"
          >
            <div className="w-full max-h-[95vh] transform overflow-y-auto rounded-[32px] border border-border bg-surface-strong shadow-[0_30px_90px_rgba(2,6,23,0.55)]">
              <ModalHeader
                title={getHeaderTitle()}
                subtitle={getHeaderSubtitle()}
                onClose={onClose}
              />

              <div className="p-4 sm:p-6 lg:p-8">
                {error && <AlertMessage type="error" message={error} />}

                {success && <AlertMessage type="success" message={success} />}

                {step === 1 && (
                  <Step1_AccountTypeSelection onNext={handleNext} />
                )}

                {step === 2 && (
                  <Step2_AccountConfiguration
                    onBack={handleBack}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
