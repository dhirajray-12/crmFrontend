import type {
  DepositFormData,
  DepositResponse,
  UserAccount,
} from "@/types/deposit.types";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const normalizePaymentMethod = (method: any) => ({
  ...method,
  bankName: method.bankName ?? method.bank_name,
  walletName: method.walletName ?? method.wallet_name,
  accountHolderName: method.accountHolderName ?? method.account_holder_name,
  accountNumber: method.accountNumber ?? method.account_number,
  ifsc_swift: method.ifsc_swift ?? method.ifscSwift ?? method.ifsc_swift_code,
  walletAddress: method.walletAddress ?? method.wallet_address,
  qrCode: normalizeAssetUrl(method.qrCode ?? method.qr_code ?? method.qrcode),
  paymentLink: method.paymentLink ?? method.payment_link,
});

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["clientPaymentMethods"],
    queryFn: async () => {
      const response = await axios.get<DepositResponse>(
        `${API_BASE_URL}/clientdeposits/payment-methods`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch payment methods");
      }

      return {
        "Bank Account": (response.data.data?.["Bank Account"] || []).map(
          normalizePaymentMethod,
        ),
        "Crypto Wallet": (response.data.data?.["Crypto Wallet"] || []).map(
          normalizePaymentMethod,
        ),
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUserAccounts = () => {
  return useQuery({
    queryKey: ["userAccounts"],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        data: UserAccount[];
      }>(`${API_BASE_URL}/accounts/`, {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      });

      if (!response.data.success) {
        throw new Error("Failed to fetch accounts");
      }

      return response.data.data;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSubmitDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepositFormData) => {
      const formData = new FormData();
      formData.append("accountId", data.accountId);
      formData.append("amount", data.amount);
      formData.append("paymentMethodId", data.paymentMethodId);
      formData.append("paymentType", data.paymentType);
      formData.append("transactionId", data.transactionId);

      if (data.proof) {
        formData.append("proofOfPayment", data.proof);
      }
     
      const response = await axios.post(
        `${API_BASE_URL}/clientdeposits`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );

      return response.data;
    },
    onSuccess: () => {
   // Invalidate ALL caches that might contain deposit data
      queryClient.invalidateQueries({ queryKey: ["userAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionsExport"] });
      queryClient.invalidateQueries({ queryKey: ["performanceData"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["availableBalances"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      
      // Also invalidate admin queries if user is admin
      queryClient.invalidateQueries({ queryKey: ["adminDeposits"] });
    },
  });
};
