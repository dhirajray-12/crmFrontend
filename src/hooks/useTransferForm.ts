import { useCallback, useState } from "react";
import type { Account, TransferFormData } from "@/types/transfer.types";

export const useTransferForm = () => {
  const [formData, setFormData] = useState<TransferFormData>({
    fromAccount: null,
    toAccount: null,
    amount: "",
  });
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  const selectFromAccount = useCallback((account: Account) => {
    setFormData((prev) => ({
      ...prev,
      fromAccount: account,
      toAccount: prev.toAccount?._id === account._id ? null : prev.toAccount,
    }));
    setFromDropdownOpen(false);
  }, []);

  const selectToAccount = useCallback((account: Account) => {
    setFormData((prev) => ({
      ...prev,
      toAccount: account,
    }));
    setToDropdownOpen(false);
  }, []);

  const updateAmount = useCallback((amount: string) => {
    setFormData((prev) => ({ ...prev, amount }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      fromAccount: null,
      toAccount: null,
      amount: "",
    });
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
  }, []);

  const validateForm = useCallback((): {
    isValid: boolean;
    error?: string;
  } => {
    if (!formData.fromAccount) {
      return { isValid: false, error: "Please select source account" };
    }

    if (!formData.toAccount) {
      return { isValid: false, error: "Please select destination account" };
    }

    if (!formData.amount || parseFloat(formData.amount) < 10) {
      return {
        isValid: false,
        error: "Please enter a valid amount (minimum $10)",
      };
    }

    if (formData.fromAccount._id === formData.toAccount._id) {
      return {
        isValid: false,
        error: "Source and destination accounts cannot be the same",
      };
    }

    if (parseFloat(formData.amount) > formData.fromAccount.balance) {
      return {
        isValid: false,
        error: "Insufficient balance in source account",
      };
    }

    return { isValid: true };
  }, [formData]);

  return {
    formData,
    fromDropdownOpen,
    toDropdownOpen,
    setFromDropdownOpen,
    setToDropdownOpen,
    selectFromAccount,
    selectToAccount,
    updateAmount,
    resetForm,
    validateForm,
  };
};