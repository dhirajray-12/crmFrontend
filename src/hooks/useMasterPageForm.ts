import type { Account, MasterAccount, MasterFormData } from "@/types/MasterPage.type";
import { validateCommission } from "@/utils/MasterPage.helper";
import { useEffect, useState } from "react";

interface UseMasterFormProps {
  mode: "create" | "update";
  master?: MasterAccount;
  accounts: Account[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const useMasterForm = ({
  mode,
  master,
  onSubmit,
  onCancel,
}: UseMasterFormProps) => {
  const [formData, setFormData] = useState<MasterFormData>({
    nickname: "",
    accountId: "",
    commission: "",
    minimumInvestment: "",
    publicChatLink: "",
    strategyDescription: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (mode === "update" && master) {
      setFormData({
        nickname: master.nickname,
        accountId: master.accountDetails.mt5Account,
        commission: master.commission.toString(),
        minimumInvestment: "1000",
        publicChatLink: "",
        strategyDescription: "",
      });
    } else if (mode === "create") {
      setFormData({
        nickname: "",
        accountId: "",
        commission: "",
        minimumInvestment: "",
        publicChatLink: "",
        strategyDescription: "",
      });
    }
  }, [mode, master]);

  const handleChange = (
    field: keyof MasterFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nickname) {
      setFormError("Nickname is required");
      return false;
    }
    if (!formData.accountId && mode === "create") {
      setFormError("Account is required");
      return false;
    }
    if (!formData.commission) {
      setFormError("Commission is required");
      return false;
    }
    const commissionNum = parseFloat(formData.commission);
    if (!validateCommission(commissionNum)) {
      setFormError("Commission must be between 0 and 50");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setFormLoading(true);
    setFormError("");

    try {
      const submitData = {
        nickname: formData.nickname,
        ...(mode === "create" && { accountId: formData.accountId }),
        commission: parseFloat(formData.commission),
        minimumInvestment: parseFloat(formData.minimumInvestment || "1000"),
        publicChatLink: formData.publicChatLink || undefined,
        strategyDescription: formData.strategyDescription || undefined,
      };

      await onSubmit(submitData);
      onCancel();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${mode} master`;
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return {
    formData,
    formLoading,
    formError,
    handleChange,
    handleSubmit,
  };
};