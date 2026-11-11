import type {
  ApiResponse,
  DashboardSummary,
  DashboardSummaryResponse,
  ProfileData,
  ProfileResponse,
  WalletOption,
  Withdrawal,
  WithdrawalFormData,
  WithdrawalHistoryResponse,
  WithdrawalRequestResponse,
  WithdrawalStats,
} from "@/types/Ibwithdrawal.types";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

class WithdrawalService {
  // Fetch profile details
  async fetchProfileDetails(): Promise<ProfileData> {
    try {
      const response = await axios.get<ProfileResponse>(
        `${API_BASE_URL}/ibclients/withdrawals/profile-details`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch profile details",
        );
      }

      return response.data.profile!;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Fetch dashboard summary
  async fetchDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await axios.get<DashboardSummaryResponse>(
        `${API_BASE_URL}/ibclients/ib-configurations/dashboard`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch dashboard summary",
        );
      }

      return (
        response.data.summary || {
          totalCommission: 0,
          withdrawableBalance: 0,
          totalWithdrawals: 0,
          partnersCount: 0,
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Dashboard summary error:", error.message);
      }
      // Return default summary on error
      return {
        totalCommission: 0,
        withdrawableBalance: 0,
        totalWithdrawals: 0,
        partnersCount: 0,
      };
    }
  }

  // Fetch withdrawal history
  async fetchWithdrawalHistory(): Promise<Withdrawal[]> {
    try {
      const response = await axios.get<WithdrawalHistoryResponse>(
        `${API_BASE_URL}/ibclients/withdrawals/history`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch withdrawal history",
        );
      }

      return response.data.withdrawals || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Save bank details to profile
  async saveBankDetails(bankDetails: any): Promise<void> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/profile/account-details`,
        bankDetails,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to save bank details");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Submit withdrawal request
  async submitWithdrawalRequest(
    data: WithdrawalFormData,
    profileData: ProfileData,
  ): Promise<Withdrawal> {
    const amount = parseFloat(data.withdrawalAmount);

    // Auto-save bank details if needed
    if (
      data.withdrawalMethod === "bank" &&
      (!profileData.bankDetails?.bankName ||
        !profileData.bankDetails?.accountNumber ||
        !profileData.bankDetails?.accountHolderName ||
        !profileData.bankDetails?.ifscSwiftCode)
    ) {
      await this.saveBankDetails({
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        ifscSwiftCode: data.ifscCode,
      });
    }

    const requestData: any = {
      amount,
      withdrawalMethod: data.withdrawalMethod,
    };

    if (data.withdrawalMethod === "bank") {
      requestData.bankDetails = {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
      };
    } else {
      requestData.walletDetails = {
        walletType: data.walletType,
        walletAddress: data.walletAddress,
      };
    }

    const response = await axios.post<WithdrawalRequestResponse>(
      `${API_BASE_URL}/ibclients/withdrawals/request`,
      requestData,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to submit withdrawal request",
      );
    }

    return response.data.withdrawal!;
  }

  // Cancel withdrawal request
  async cancelWithdrawal(withdrawalId: string): Promise<void> {
    try {
      const response = await axios.delete<ApiResponse<any>>(
        `${API_BASE_URL}/ibclients/withdrawals/${withdrawalId}`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to cancel withdrawal");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Get wallet options from profile
  getWalletOptions(profileData: ProfileData | null): WalletOption[] {
    if (!profileData?.walletDetails) return [];

    return [
      {
        type: "USDT",
        address: profileData.walletDetails.tetherWalletAddress || "",
        network: "TRC20/ERC20",
      },
      {
        type: "ETH",
        address: profileData.walletDetails.ethWalletAddress || "",
        network: "ERC20",
      },
      {
        type: "TRX",
        address: profileData.walletDetails.trxWalletAddress || "",
        network: "TRC20",
      },
    ].filter((w) => w.address);
  }

  // Calculate withdrawal stats
  calculateStats(withdrawals: Withdrawal[]): WithdrawalStats {
    return {
      totalWithdrawn: withdrawals
        .filter((w) => w.status === "approved" || w.status === "completed")
        .reduce((sum, w) => sum + w.amount, 0),
      pendingAmount: withdrawals
        .filter((w) => w.status === "pending")
        .reduce((sum, w) => sum + w.amount, 0),
      completedCount: withdrawals.filter(
        (w) => w.status === "approved" || w.status === "completed",
      ).length,
    };
  }

  // Get status icon and color
  getStatusInfo(status: string) {
    const statusMap: Record<string, { icon: string; color: string }> = {
      approved: { icon: "CheckCircle", color: "text-emerald-300" },
      completed: { icon: "CheckCircle", color: "text-emerald-300" },
      rejected: { icon: "XCircle", color: "text-red-300" },
      pending: { icon: "Clock", color: "text-amber-300" },
    };

    return statusMap[status] || { icon: "Clock", color: "text-amber-300" };
  }
}

export const withdrawalService = new WithdrawalService();
