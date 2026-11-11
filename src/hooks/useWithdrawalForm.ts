import { useState } from "react";
import type {
  Account,
  WithdrawalFormData,
  SavedPayoutDetails,
} from "@/types/withdrawal.types";

const EMPTY_BANK_FIELDS = {
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
};

const EMPTY_WALLET_FIELDS = {
  walletType: "",
  walletAddress: "",
};

export const useWithdrawalForm = (savedPayoutDetails: SavedPayoutDetails | null) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    account: "",
    amount: "",
    method: "",
  });
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showEWalletOptions, setShowEWalletOptions] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState("");
  const savedWallets = savedPayoutDetails?.wallets || null;
  const savedBankDetails = savedPayoutDetails?.bankDetails || null;

  const getFirstSavedWallet = () => {
    if (!savedWallets) return null;

    if (savedWallets.usdt) {
      return { walletType: "USDT", walletAddress: savedWallets.usdt };
    }
    if (savedWallets.eth) {
      return {
        walletType: "Ethereum (ETH)",
        walletAddress: savedWallets.eth,
      };
    }
    if (savedWallets.tron) {
      return {
        walletType: "TRON (TRX)",
        walletAddress: savedWallets.tron,
      };
    }

    return null;
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setFormData((prev) => ({ ...prev, account: account.account }));
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);

    setFormData((prev) => {
      const nextData: WithdrawalFormData = { ...prev, method };

      if (method === "Bank Transfer") {
        nextData.bankName = savedBankDetails?.bankName || "";
        nextData.accountHolderName = savedBankDetails?.accountHolderName || "";
        nextData.accountNumber = savedBankDetails?.accountNumber || "";
        nextData.ifscCode = savedBankDetails?.ifscCode || "";
        nextData.walletType = "";
        nextData.walletAddress = "";
      } else if (method === "E-Wallet") {
        const firstSavedWallet = getFirstSavedWallet();
        nextData.bankName = "";
        nextData.accountHolderName = "";
        nextData.accountNumber = "";
        nextData.ifscCode = "";
        nextData.walletType = firstSavedWallet?.walletType || "";
        nextData.walletAddress = firstSavedWallet?.walletAddress || "";
      } else {
        // Card: the money goes back to the card, no payout details needed.
        Object.assign(nextData, EMPTY_BANK_FIELDS, EMPTY_WALLET_FIELDS);
      }

      return nextData;
    });

    if (method !== "E-Wallet") {
      setShowEWalletOptions(false);
      setSelectedWalletType("");
    } else {
      const firstSavedWallet = getFirstSavedWallet();
      setSelectedWalletType(firstSavedWallet?.walletType || "");
    }
  };

  const handleInputChange = (
    field: keyof WithdrawalFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWalletTypeSelect = (walletType: string) => {
    setSelectedWalletType(walletType);
    handleInputChange("walletType", walletType);
    setShowEWalletOptions(false);
  };

  const handleWalletInput = (value: string) => {
    setFormData((prev) => ({ ...prev, walletAddress: value }));

    if (!savedWallets) return;

    if (value === savedWallets.usdt) {
      setSelectedWalletType("USDT");
      setFormData((prev) => ({ ...prev, walletType: "USDT" }));
    } else if (value === savedWallets.eth) {
      setSelectedWalletType("Ethereum (ETH)");
      setFormData((prev) => ({ ...prev, walletType: "Ethereum (ETH)" }));
    } else if (value === savedWallets.tron) {
      setSelectedWalletType("TRON (TRX)");
      setFormData((prev) => ({ ...prev, walletType: "TRON (TRX)" }));
    }
  };

  const clearBankDetails = () => {
    setFormData((prev) => ({ ...prev, ...EMPTY_BANK_FIELDS }));
  };

  const clearWalletDetails = () => {
    setSelectedWalletType("");
    setShowEWalletOptions(false);
    setFormData((prev) => ({ ...prev, ...EMPTY_WALLET_FIELDS }));
  };

  const resetForm = () => {
    setFormData({ account: "", amount: "", method: "" });
    setSelectedMethod("");
    setSelectedWalletType("");
    setShowEWalletOptions(false);
    setSelectedAccount(null);
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!selectedAccount) {
      return { isValid: false, error: "Please select an account" };
    }
    if (!formData.amount || parseFloat(formData.amount) < 1) {
      return {
        isValid: false,
        error: "Please enter a valid amount (minimum $1)",
      };
    }
    if (!selectedMethod) {
      return { isValid: false, error: "Please select a withdrawal method" };
    }
    if (selectedMethod === "Bank Transfer") {
      if (
        !formData.bankName ||
        !formData.accountHolderName ||
        !formData.accountNumber ||
        !formData.ifscCode
      ) {
        return { isValid: false, error: "Please fill in all bank details" };
      }
    } else if (selectedMethod === "E-Wallet") {
      if (!selectedWalletType || !formData.walletAddress) {
        return {
          isValid: false,
          error: "Please select wallet type and enter wallet address",
        };
      }
    }
    return { isValid: true };
  };

  const getWithdrawalRequestBody = () => ({
    accountId: selectedAccount?._id,
    accountNumber: selectedAccount?.accountNumber,
    accountType: selectedAccount?.accountType,
    amount: Number(formData.amount),
    paymentMethod:
      selectedMethod === "Bank Transfer"
        ? "bank"
        : selectedMethod === "Card (Stripe)"
          ? "stripe_card"
          : selectedWalletType.toLowerCase(),
    bankDetails:
      selectedMethod === "Bank Transfer"
        ? {
            bankName: formData.bankName,
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
          }
        : undefined,
    eWalletDetails:
      selectedMethod === "E-Wallet"
        ? {
            type: selectedWalletType.toLowerCase(),
            walletId: formData.walletAddress,
          }
        : undefined,
  });

  return {
    selectedAccount,
    formData,
    selectedMethod,
    showEWalletOptions,
    selectedWalletType,
    handleAccountSelect,
    handleMethodSelect,
    handleInputChange,
    handleWalletTypeSelect,
    handleWalletInput,
    setShowEWalletOptions,
    clearBankDetails,
    clearWalletDetails,
    resetForm,
    validateForm,
    getWithdrawalRequestBody,
  };
};
