import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { WithdrawalRequestBody } from "@/types/withdrawal.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useSubmitWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: WithdrawalRequestBody) => {
      const response = await axios.post(`${API_BASE_URL}/withdrawals`, body, {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["myAccountsList"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionsExport"] });
      queryClient.invalidateQueries({ queryKey: ["performanceData"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["availableBalances"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
};
