import type {
  MasterAccount,
  Account,
  ApiResponse,
  CreateMasterFormData,
} from "@/types/master.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

class MasterService {
  async getMasters(): Promise<MasterAccount[]> {
    const response = await fetch(`${API_BASE_URL}/copy-trade/masters`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch masters: ${response.status}`);
    }

    const data: ApiResponse<MasterAccount[]> = await response.json();
    return data.data || [];
  }

  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/copy-trade/admin/accounts`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.status}`);
    }

    const data: ApiResponse<Account[]> = await response.json();
    return data.data || [];
  }

  async createMaster(formData: CreateMasterFormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/copy-trade/masters`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify({
        nickname: formData.nickname,
        accountId: formData.accountId,
        commission: parseFloat(formData.commission),
        minimumInvestment: parseFloat(formData.minimumInvestment),
        publicChatLink: formData.publicChatLink || undefined,
        strategyDescription: formData.strategyDescription || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create master");
    }
  }

  async updateMaster(
    masterId: string,
    formData: CreateMasterFormData,
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/copy-trade/masters/${masterId}`,
      {
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
        body: JSON.stringify({
          nickname: formData.nickname,
          commission: parseFloat(formData.commission),
          minimumInvestment: parseFloat(formData.minimumInvestment),
          publicChatLink: formData.publicChatLink || undefined,
          strategyDescription: formData.strategyDescription || undefined,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update master");
    }
  }

  async deleteMaster(masterId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/copy-trade/masters/${masterId}`,
      {
        method: "DELETE",
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete master");
    }
  }
}

export default MasterService;
