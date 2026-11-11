import { accountApi } from "@/services/AccountList.service";
import { useToastStore } from "@/Store/toast.store";
import { useState } from "react";

export const usePasswordUpdate = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInvestor, setShowInvestor] = useState(false);
  const [showMaster, setShowMaster] = useState(false);
  const [newInvestorPassword, setNewInvestorPassword] = useState("");
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const addToast = useToastStore((state) => state.addToast);

  const updatePasswords = async (accountId: string) => {
    if (!accountId) {
      const error = "Please enter account ID";
      addToast("error", error);
      return { success: false, error };
    }

    if (!newInvestorPassword && !newMasterPassword) {
      const error = "Please enter at least one new password";
      addToast("error", error);
      return {
        success: false,
        error,
      };
    }

    setIsUpdating(true);

    try {
      const updateData: any = {};
      if (newInvestorPassword) updateData.investor_pwd = newInvestorPassword;
      if (newMasterPassword) updateData.master_pwd = newMasterPassword;

      const response = await accountApi.updatePasswords(
        accountId,
        updateData,
      );

      const isSuccess =
        response.data?.success === true ||
        (Array.isArray(response.data) && response.data[0]?.success);

      if (isSuccess) {
        const updatedPasswords = {
          investorPassword: newInvestorPassword || undefined,
          masterPassword: newMasterPassword || undefined,
        };

        setNewInvestorPassword("");
        setNewMasterPassword("");
        addToast(
          "success",
          response.data?.message || "Account passwords updated successfully!",
        );
        onSuccess?.();
        return { success: true, updatedPasswords };
      }

      const error = response.data?.message || "Failed to update passwords";
      addToast("error", error);
      return { success: false, error };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update password(s)";
      addToast("error", message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const resetPasswords = () => {
    setNewInvestorPassword("");
    setNewMasterPassword("");
  };

  return {
    isUpdating,
    showInvestor,
    showMaster,
    newInvestorPassword,
    newMasterPassword,
    setShowInvestor,
    setShowMaster,
    setNewInvestorPassword,
    setNewMasterPassword,
    updatePasswords,
    resetPasswords,
  };
};
