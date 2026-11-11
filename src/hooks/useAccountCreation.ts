import { accountApi } from "@/services/OpenAccount.service";
import { useToastStore } from "@/Store/toast.store";
import type {
  AccountFormData,
  BackendAccountResponse,
  Group,
  UserInfo,
} from "@/types/OpenAccount.type";
import {
  formatErrorMessage,
  validateMT5Account,
} from "@/utils/OpenAccount.Helper";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useAccountCreation = (
  selectedGroup: Group | undefined,
  user: UserInfo | null,
  onSuccess: (data: BackendAccountResponse["data"]) => void,
) => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    leverage: "",
    customMT5Account: "",
    masterPassword: "",
    investorPassword: "",
  });

  const updateFormData = (key: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      leverage: "",
      customMT5Account: "",
      masterPassword: "",
      investorPassword: "",
    });
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!selectedGroup) {
      return { isValid: false, error: "Please select an account type." };
    }

    if (!user) {
      return {
        isValid: false,
        error: "User information not found. Please login again.",
      };
    }

    if (!formData.leverage) {
      return { isValid: false, error: "Please select a leverage option." };
    }

    if (
      formData.customMT5Account &&
      !validateMT5Account(formData.customMT5Account)
    ) {
      return {
        isValid: false,
        error:
          "❌ MT5 Account Number must be 7 to 12 digits only (no letters or symbols).",
      };
    }

    return { isValid: true };
  };

  const createAccount = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      addToast("error", validation.error || "Please check the form.");
      return false;
    }

    if (!selectedGroup || !user) return false;

    setLoading(true);

    try {
      const leverageValue = parseInt(formData.leverage.replace("1:", ""), 10);

      const requestData = {
        leverage: leverageValue,
        accountType: selectedGroup.value,
        platform: selectedGroup.platforms,
        customMT5Account: formData.customMT5Account || null,
        masterPassword: formData.masterPassword || "",
        investorPassword: formData.investorPassword || "",
      };

      const response = await accountApi.createAccount(requestData);

      if (!response.data || response.success === false) {
        // Try to get a message from a known error property, otherwise use a generic message
        const serverMsg =
          (response.data && (response.data as any).message) ||
          "Server returned an error";
        addToast("error", serverMsg);
        return false;
      }

      const accountData = response.data;
      if (!accountData) {
        addToast("error", "No account data returned from server.");
        return false;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["myAccountsList"] }),
        queryClient.invalidateQueries({ queryKey: ["availableBalances"] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ["accounts"] });

      onSuccess(accountData);
      return true;
    } catch (err: any) {
      console.error("❌ Error creating account:", err);
      const errorMessage = formatErrorMessage(err);
      addToast("error", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formData,
    updateFormData,
    resetForm,
    createAccount,
  };
};
